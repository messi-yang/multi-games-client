import { ChangePlayerActionCommand } from '@/services/world-journey-service/managers/command-manager/commands/change-player-action-command';
import { Command } from '@/services/world-journey-service/managers/command-manager/command';
import { PlayerActionDto, newPlayerActionDto, parsePlayerActionDto } from '../dtos/player-action-dto';
import { PrecisePositionDto, newPrecisePositionDto } from '../dtos/precise-position-dto';
import { ChangePlayerPrecisePositionCommand } from '@/services/world-journey-service/managers/command-manager/commands/change-player-precise-position-command';
import { PrecisePositionVo } from '@/models/world/common/precise-position-vo';
import { DateVo } from '@/models/global/date-vo';
import { CommandNameEnum } from '@/services/world-journey-service/managers/command-manager/command-name-enum';
import { dispatchCommand } from '@/services/world-journey-service/managers/command-manager/utils';

type ChangePlayerActionCommandDto = {
  id: string;
  timestamp: number;
  name: CommandNameEnum.ChangePlayerAction;
  payload: {
    playerId: string;
    playerAction: PlayerActionDto;
  };
};

type ChangePlayerPrecisePositionCommandDto = {
  id: string;
  timestamp: number;
  name: CommandNameEnum.ChangePlayerPrecisePosition;
  payload: {
    playerId: string;
    precisePosition: PrecisePositionDto;
  };
};

function parseChangePlayerActionCommand(command: ChangePlayerActionCommandDto): ChangePlayerActionCommand {
  return ChangePlayerActionCommand.createRemote(
    command.id,
    DateVo.fromTimestamp(command.timestamp),
    command.payload.playerId,
    parsePlayerActionDto(command.payload.playerAction)
  );
}

function parseChangePlayerPrecisePositionCommand(command: ChangePlayerPrecisePositionCommandDto): ChangePlayerPrecisePositionCommand {
  return ChangePlayerPrecisePositionCommand.createRemote(
    command.id,
    DateVo.fromTimestamp(command.timestamp),
    command.payload.playerId,
    PrecisePositionVo.create(command.payload.precisePosition.x, command.payload.precisePosition.z)
  );
}

export const parseCommandDto = (commandDto: CommandDto) => {
  if (commandDto.name === CommandNameEnum.ChangePlayerAction) {
    return parseChangePlayerActionCommand(commandDto);
  } else if (commandDto.name === CommandNameEnum.ChangePlayerPrecisePosition) {
    return parseChangePlayerPrecisePositionCommand(commandDto);
  }
  return null;
};

export const toCommandDto = (sourceCommand: Command) => {
  return dispatchCommand<CommandDto | null>(sourceCommand, {
    [CommandNameEnum.ChangePlayerAction]: (command) => ({
      id: command.getId(),
      timestamp: command.getCreatedAtTimestamp(),
      name: CommandNameEnum.ChangePlayerAction,
      payload: {
        playerId: command.getPlayerId(),
        playerAction: newPlayerActionDto(command.getAction()),
      },
    }),
    [CommandNameEnum.ChangePlayerPrecisePosition]: (command) => ({
      id: command.getId(),
      timestamp: command.getCreatedAtTimestamp(),
      name: CommandNameEnum.ChangePlayerPrecisePosition,
      payload: {
        playerId: command.getPlayerId(),
        precisePosition: newPrecisePositionDto(command.getPrecisePosition()),
      },
    }),
    [CommandNameEnum.AddPlayer]: () => null,
    [CommandNameEnum.RemovePlayer]: () => null,
  });
};

export { CommandNameEnum };

export type CommandDto = ChangePlayerActionCommandDto | ChangePlayerPrecisePositionCommandDto;
