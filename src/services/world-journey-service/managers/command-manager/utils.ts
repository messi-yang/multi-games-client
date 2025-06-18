import { Command } from './command';
import { CommandNameEnum } from './command-name-enum';
import { AddPlayerCommand } from './commands/add-player-command';
import { ChangePlayerActionCommand } from './commands/change-player-action-command';
import { ChangePlayerPrecisePositionCommand } from './commands/change-player-precise-position-command';
import { RemovePlayerCommand } from './commands/remove-player-command';

/**
 * This function is mainly for making sure you handle every type of command
 */
export const dispatchCommand = <T>(
  command: Command,
  mapper: {
    [CommandNameEnum.AddPlayer]: (_unit: AddPlayerCommand) => T;
    [CommandNameEnum.ChangePlayerAction]: (_unit: ChangePlayerActionCommand) => T;
    [CommandNameEnum.ChangePlayerPrecisePosition]: (_unit: ChangePlayerPrecisePositionCommand) => T;
    [CommandNameEnum.RemovePlayer]: (_unit: RemovePlayerCommand) => T;
  }
): T => {
  if (command instanceof AddPlayerCommand) {
    return mapper[CommandNameEnum.AddPlayer](command);
  } else if (command instanceof ChangePlayerActionCommand) {
    return mapper[CommandNameEnum.ChangePlayerAction](command);
  } else if (command instanceof ChangePlayerPrecisePositionCommand) {
    return mapper[CommandNameEnum.ChangePlayerPrecisePosition](command);
  } else if (command instanceof RemovePlayerCommand) {
    return mapper[CommandNameEnum.RemovePlayer](command);
  }
  throw new Error(`The command name ${command.getName()} is not handled here`);
};
