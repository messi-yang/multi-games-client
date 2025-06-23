import { sleep } from '@/utils/general';
import { EventHandler, EventHandlerSubscriber } from '../../../../event-dispatchers/common/event-handler';
import { DateVo } from '@/models/global/date-vo';
import { GameManager } from '../game-manager';
import { CommandModel } from '@/models/game/command-model';
import { GameModel } from '@/models/game/game-model';

export class CommandManager {
  constructor(
    private gameManager: GameManager,
    private executedCommands: CommandModel[] = [],
    private historyGameState: object[] = [],
    private executedCommandMap: Record<string, CommandModel | undefined> = {},
    private failedCommandMap: Record<string, true | undefined> = {},
    private isReplayingCommands = false,
    private bufferedCommandsFromReplaying: CommandModel[] = [],
    private commandExecutedEventHandler: EventHandler<CommandModel> = EventHandler.create<CommandModel>()
  ) {
    this.initialize(gameManager.getCurrentGame());
  }

  static create(gameManager: GameManager) {
    return new CommandManager(gameManager);
  }

  public initialize(currentGame: GameModel) {
    this.executedCommands = [];
    this.historyGameState = [currentGame.getState()];
    this.executedCommandMap = {};
    this.failedCommandMap = {};
    this.isReplayingCommands = false;
  }

  private getExecutedCommand(id: string): CommandModel | null {
    return this.executedCommandMap[id] ?? null;
  }

  private addExecutedCommand(command: CommandModel) {
    const currentGameState = this.gameManager.getCurrentGame().getState();
    const newGameState = command.execute(currentGameState);

    this.executedCommands.push(command);
    this.executedCommandMap[command.getId()] = command;
    this.historyGameState.push(newGameState);
    this.gameManager.updateCurrentGameState(newGameState);
  }

  private popExecutedCommand(): CommandModel | null {
    const executedCommand = this.executedCommands.pop();
    if (!executedCommand) return null;
    delete this.executedCommandMap[executedCommand.getId()];

    this.historyGameState.pop();

    const lastLastGameState = this.historyGameState[this.historyGameState.length - 1];
    console.log('lastLastGameState', lastLastGameState);
    this.gameManager.updateCurrentGameState(lastLastGameState);

    return executedCommand;
  }

  private getFailedCommand(id: string): boolean {
    return this.failedCommandMap[id] ?? false;
  }

  private addFailedCommandId(commandId: string) {
    this.failedCommandMap[commandId] = true;
  }

  public getIsReplayingCommands() {
    return this.isReplayingCommands;
  }

  public removeFailedCommand(commandId: string) {
    this.addFailedCommandId(commandId);

    const executedCommand = this.getExecutedCommand(commandId);
    if (!executedCommand) return;

    const commandsToReExecute: CommandModel[] = [];

    while (true) {
      const lastExecutedCommand = this.popExecutedCommand();
      if (!lastExecutedCommand) break;

      const lastExecutedCommandId = lastExecutedCommand.getId();
      const isLastExecutedCommandFailedCommand = lastExecutedCommandId === commandId;

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

    const commandsToReExecute: CommandModel[] = [];
    let executedCommand = this.popExecutedCommand();
    let lastCommandCreatedTimestamp = now.toTimestamp();
    while (executedCommand && executedCommand.isExecutedBetween(milisecondsAgo, now)) {
      await sleep((lastCommandCreatedTimestamp - executedCommand.getExecutedAt().toTimestamp()) / speed);
      lastCommandCreatedTimestamp = executedCommand.getExecutedAt().toTimestamp();

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

  public executeRemoteCommand(command: CommandModel) {
    if (this.isReplayingCommands) {
      this.bufferedCommandsFromReplaying.push(command);
      return;
    }
    this.executeCommand(command);
  }

  public executeLocalCommand(command: CommandModel) {
    if (this.isReplayingCommands) return;
    if (this.gameManager.getCurrentGame().isEnded()) return;

    if (this.executeCommand(command)) {
      this.publishLocalCommandExecutedEvent(command);
    }
  }

  private executeCommand(command: CommandModel): boolean {
    const commandId = command.getId();

    // If it's already executed, do nothing
    const duplicatedCommand = this.getExecutedCommand(commandId);
    if (duplicatedCommand) return false;

    // If it failed before, do nothing
    const failedCommand = this.getFailedCommand(commandId);
    if (failedCommand) return false;

    const currentGame = this.gameManager.getCurrentGame();
    if (currentGame.getId() !== command.getGameId()) return false;

    console.log('hey original commands', [...this.executedCommands]);

    console.log('hey command', command);

    // If the command is executed before the poped command, pop the command, reset the state and execute the command again, do this until the command is executed after the poped command
    const commandsToExecute: CommandModel[] = [];
    let lastExecutedCommand = this.popExecutedCommand();
    while (lastExecutedCommand) {
      if (lastExecutedCommand && lastExecutedCommand.getExecutedAt().isBefore(command.getExecutedAt())) {
        this.addExecutedCommand(lastExecutedCommand);
        break;
      } else {
        commandsToExecute.push(lastExecutedCommand);
        lastExecutedCommand = this.popExecutedCommand();
      }
    }

    // insert command into the second last position
    commandsToExecute.push(command);
    console.log('hey commandsToExecute', commandsToExecute);

    for (let i = commandsToExecute.length - 1; i >= 0; i -= 1) {
      const commandToExecute = commandsToExecute[i];
      // console.log('hey oldGameState', clonedGameState);
      // console.log('hey commandToExecute', commandToExecute);
      // console.log('heynewGameState', newGameState);
      this.addExecutedCommand(commandToExecute);
    }

    console.log('hey updated commands', [...this.executedCommands]);

    return true;
  }

  public subscribeLocalCommandExecutedEvent(subscriber: EventHandlerSubscriber<CommandModel>): () => void {
    return this.commandExecutedEventHandler.subscribe(subscriber);
  }

  private publishLocalCommandExecutedEvent(command: CommandModel) {
    this.commandExecutedEventHandler.publish(command);
  }
}
