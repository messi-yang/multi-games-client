import { sleep } from '@/utils/general';
import { Command } from './command';
import { EventHandler, EventHandlerSubscriber } from '../../../../event-dispatchers/common/event-handler';
import { DateVo } from '@/models/global/date-vo';
import { RoomModel } from '@/models/game/room/room-model';
import { PlayerManager } from '../player-manager';
import { PerspectiveManager } from '../perspective-manager';

export class CommandManager {
  constructor(
    private room: RoomModel,
    private playerManager: PlayerManager,
    private perspectiveManager: PerspectiveManager,
    private executedCommands: Command[] = [],
    private executedCommandMap: Record<string, Command | undefined> = {},
    private failedCommandMap: Record<string, true | undefined> = {},
    private isReplayingCommands = false,
    private bufferedCommandsFromReplaying: Command[] = [],
    private commandExecutedEventHandler: EventHandler<Command> = EventHandler.create<Command>(),
    /**
     * Some commands require item to be loaded prior to execution, so we buffer them when those items
     * are not loaded yet when getting executed.
     */
    private bufferedCommandsByRequiredItem: Map<string, Command[]> = new Map()
  ) {}

  static create(room: RoomModel, playerManager: PlayerManager, perspectiveManager: PerspectiveManager) {
    return new CommandManager(room, playerManager, perspectiveManager);
  }

  private getExecutedCommand(id: string): Command | null {
    return this.executedCommandMap[id] ?? null;
  }

  private addExecutedCommand(command: Command) {
    this.executedCommands.push(command);
    this.executedCommandMap[command.getId()] = command;
  }

  private doesFailedCommandExist(id: string): boolean {
    return this.failedCommandMap[id] ?? false;
  }

  private addFailedCommandId(commandId: string) {
    this.failedCommandMap[commandId] = true;
  }

  private popExecutedCommand(): Command | null {
    const command = this.executedCommands.pop();
    if (!command) return null;

    delete this.executedCommandMap[command.getId()];
    return command;
  }

  public getIsReplayingCommands() {
    return this.isReplayingCommands;
  }

  public removeFailedCommand(commandId: string) {
    this.addFailedCommandId(commandId);

    const executedCommand = this.getExecutedCommand(commandId);
    if (!executedCommand) return;

    const commandsToReExecute: Command[] = [];

    while (true) {
      const lastExecutedCommand = this.popExecutedCommand();
      if (!lastExecutedCommand) break;

      const lastExecutedCommandId = lastExecutedCommand.getId();
      const isLastExecutedCommandFailedCommand = lastExecutedCommandId === commandId;

      if (isLastExecutedCommandFailedCommand) {
        lastExecutedCommand.undo();
        this.addFailedCommandId(lastExecutedCommandId);
        break;
      } else {
        lastExecutedCommand.undo();
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
    const milisecondsAgo = DateVo.fromTimestamp(now.getTimestamp() - duration);

    const commandsToReExecute: Command[] = [];
    let command: Command | null = this.popExecutedCommand();
    let lastCommandCreatedTimestamp = now.getTimestamp();
    while (command && command.isCreatedBetween(milisecondsAgo, now)) {
      await sleep((lastCommandCreatedTimestamp - command.getCreatedAtTimestamp()) / speed);
      lastCommandCreatedTimestamp = command.getCreatedAtTimestamp();

      command.undo();
      commandsToReExecute.push(command);

      command = this.popExecutedCommand();
    }

    lastCommandCreatedTimestamp = now.getTimestamp();
    for (let i = commandsToReExecute.length - 1; i >= 0; i -= 1) {
      const commandToReExecute = commandsToReExecute[i];
      await sleep((commandToReExecute.getCreatedAtTimestamp() - lastCommandCreatedTimestamp) / speed);
      lastCommandCreatedTimestamp = commandToReExecute.getCreatedAtTimestamp();

      this.executeCommand(commandToReExecute);
    }

    this.bufferedCommandsFromReplaying.forEach((_command) => {
      this.executeCommand(_command);
    });
    this.isReplayingCommands = false;
  }

  public executeRemoteCommand(command: Command) {
    if (this.isReplayingCommands) {
      this.bufferedCommandsFromReplaying.push(command);
      return;
    }
    this.executeCommand(command);
  }

  public executeLocalCommand(command: Command) {
    if (this.isReplayingCommands) return;
    if (this.executeCommand(command)) {
      this.publishLocalCommandExecutedEvent(command);
    }
  }

  private executeCommand(command: Command): boolean {
    const commandId = command.getId();

    // If it's already executed, do nothing
    const duplicatedCommand = this.getExecutedCommand(commandId);
    if (duplicatedCommand) return false;

    // If it failed before, do nothing
    const hasCommandAlreadyFailed = this.doesFailedCommandExist(commandId);
    if (hasCommandAlreadyFailed) return false;

    command.execute({
      room: this.room,
      playerManager: this.playerManager,
      perspectiveManager: this.perspectiveManager,
    });
    this.addExecutedCommand(command);

    return true;
  }

  public subscribeLocalCommandExecutedEvent(subscriber: EventHandlerSubscriber<Command>): () => void {
    return this.commandExecutedEventHandler.subscribe(subscriber);
  }

  private publishLocalCommandExecutedEvent(command: Command) {
    this.commandExecutedEventHandler.publish(command);
  }
}
