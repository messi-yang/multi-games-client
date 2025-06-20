import { sleep } from '@/utils/general';
import { EventHandler, EventHandlerSubscriber } from '../../../../event-dispatchers/common/event-handler';
import { DateVo } from '@/models/global/date-vo';
import { PlayerManager } from '../player-manager';
import { RoomManager } from '../room-manager';
import { GameManager } from '../game-manager';
import { CommandModel } from '@/models/game/command-model';

export class CommandManager {
  constructor(
    private roomManager: RoomManager,
    private gameManager: GameManager,
    private playerManager: PlayerManager,
    private executedCommands: CommandModel<object>[] = [],
    private historyGameState: object[] = [],
    private executedCommandMap: Record<string, CommandModel<object> | undefined> = {},
    private failedCommandMap: Record<string, true | undefined> = {},
    private isReplayingCommands = false,
    private bufferedCommandsFromReplaying: CommandModel<object>[] = [],
    private commandExecutedEventHandler: EventHandler<CommandModel<object>> = EventHandler.create<CommandModel<object>>()
  ) {}

  static create(roomManager: RoomManager, gameManager: GameManager, playerManager: PlayerManager) {
    return new CommandManager(roomManager, gameManager, playerManager);
  }

  private popHistoryGameState(): object | null {
    return this.historyGameState.pop() ?? null;
  }

  private addHistoryGameState(gameState: object) {
    this.historyGameState.push(gameState);
  }

  private getExecutedCommand(id: string): CommandModel<object> | null {
    return this.executedCommandMap[id] ?? null;
  }

  private addExecutedCommand(command: CommandModel<object>) {
    this.executedCommands.push(command);
    this.executedCommandMap[command.getId()] = command;
  }

  private doesFailedCommandExist(id: string): boolean {
    return this.failedCommandMap[id] ?? false;
  }

  private addFailedCommandId(commandId: string) {
    this.failedCommandMap[commandId] = true;
  }

  private popExecutedCommand(): CommandModel<object> | null {
    const executedCommand = this.executedCommands.pop();
    if (!executedCommand) return null;

    delete this.executedCommandMap[executedCommand.getId()];
    return executedCommand;
  }

  public getIsReplayingCommands() {
    return this.isReplayingCommands;
  }

  public removeFailedCommand(commandId: string) {
    this.addFailedCommandId(commandId);

    const executedCommand = this.getExecutedCommand(commandId);
    if (!executedCommand) return;

    const commandsToReExecute: CommandModel<object>[] = [];

    while (true) {
      const lastExecutedCommand = this.popExecutedCommand();
      if (!lastExecutedCommand) break;

      const lastGameState = this.popHistoryGameState();
      if (!lastGameState) break;

      const lastExecutedCommandId = lastExecutedCommand.getId();
      const isLastExecutedCommandFailedCommand = lastExecutedCommandId === commandId;

      this.gameManager.updateCurrentGameState(lastGameState);

      if (isLastExecutedCommandFailedCommand) {
        this.addFailedCommandId(lastExecutedCommandId);
        break;
      } else {
        commandsToReExecute.push(lastExecutedCommand);
      }
    }

    for (let i = commandsToReExecute.length - 1; i >= 0; i -= 1) {
      const commandToReExecute = commandsToReExecute[i];
      this.executeCommand(commandToReExecute);
    }
  }

  /**
   * Replays commands executed within the specified duration.
   * @param duration miliseconds
   * @param speed 1 means normal speed
   */
  public async replayCommands(duration: number, speed: number) {
    this.isReplayingCommands = true;

    const now = DateVo.now();
    const milisecondsAgo = DateVo.fromTimestamp(now.toTimestamp() - duration);

    const commandsToReExecute: CommandModel<object>[] = [];
    let executedCommand = this.popExecutedCommand();
    let lastCommandCreatedTimestamp = now.toTimestamp();
    while (executedCommand && executedCommand.isExecutedBetween(milisecondsAgo, now)) {
      const lastGameState = this.popHistoryGameState();
      if (!lastGameState) break;

      await sleep((lastCommandCreatedTimestamp - executedCommand.getExecutedAt().toTimestamp()) / speed);
      lastCommandCreatedTimestamp = executedCommand.getExecutedAt().toTimestamp();

      this.gameManager.updateCurrentGameState(lastGameState);
      commandsToReExecute.push(executedCommand);

      executedCommand = this.popExecutedCommand();
    }

    lastCommandCreatedTimestamp = now.toTimestamp();
    for (let i = commandsToReExecute.length - 1; i >= 0; i -= 1) {
      const commandToReExecute = commandsToReExecute[i];
      await sleep((commandToReExecute.getExecutedAt().toTimestamp() - lastCommandCreatedTimestamp) / speed);
      lastCommandCreatedTimestamp = commandToReExecute.getExecutedAt().toTimestamp();

      this.executeCommand(commandToReExecute);
    }

    this.bufferedCommandsFromReplaying.forEach((_command) => {
      this.executeCommand(_command);
    });
    this.isReplayingCommands = false;
  }

  public executeRemoteCommand(command: CommandModel<object>) {
    if (this.isReplayingCommands) {
      this.bufferedCommandsFromReplaying.push(command);
      return;
    }
    this.executeCommand(command);
  }

  public executeLocalCommand(command: CommandModel<object>) {
    if (this.isReplayingCommands) return;
    if (this.gameManager.getCurrentGame().isEnded()) return;

    if (this.executeCommand(command)) {
      this.publishLocalCommandExecutedEvent(command);
    }
  }

  private executeCommand(command: CommandModel<object>): boolean {
    const commandId = command.getId();

    // If it's already executed, do nothing
    const duplicatedCommand = this.getExecutedCommand(commandId);
    if (duplicatedCommand) return false;

    // If it failed before, do nothing
    const hasCommandAlreadyFailed = this.doesFailedCommandExist(commandId);
    if (hasCommandAlreadyFailed) return false;

    const currentGame = this.gameManager.getCurrentGame();
    if (currentGame.getId() !== command.getGameId()) return false;

    const clonedGameState = JSON.parse(JSON.stringify(currentGame.getState()));
    const newGameState = command.execute(clonedGameState);
    this.gameManager.updateCurrentGameState(newGameState);

    this.addExecutedCommand(command);
    this.addHistoryGameState(newGameState);

    return true;
  }

  public subscribeLocalCommandExecutedEvent(subscriber: EventHandlerSubscriber<CommandModel<object>>): () => void {
    return this.commandExecutedEventHandler.subscribe(subscriber);
  }

  private publishLocalCommandExecutedEvent(command: CommandModel<object>) {
    this.commandExecutedEventHandler.publish(command);
  }
}
