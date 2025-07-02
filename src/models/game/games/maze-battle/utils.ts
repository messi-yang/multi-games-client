import { DirectionEnum } from './direction-enum';

// output has to be 6 characters long
export function getRandomColor(): string {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);
  return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
}

export function reverseDirection(direction: DirectionEnum): DirectionEnum {
  const directions = [DirectionEnum.Left, DirectionEnum.Up, DirectionEnum.Right, DirectionEnum.Down];

  const index = directions.indexOf(direction);
  return directions[(index + 2) % directions.length];
}
