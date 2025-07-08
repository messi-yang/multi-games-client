import { GameNameEnum } from '../../game-name-enum';

export enum MazeBattleCommandNameEnum {
  Move = `${GameNameEnum.MazeBattle}#move`,
  SwitchPosition = `${GameNameEnum.MazeBattle}#switch-position`,
  ReverseDirection = `${GameNameEnum.MazeBattle}#reverse-direction`,
  CancelReverse = `${GameNameEnum.MazeBattle}#cancel-reverse`,
}
