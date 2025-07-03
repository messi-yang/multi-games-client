import { DirectionEnum } from './direction-enum';

const PRESET_COLORS = [
  '#FF0000',
  '#DD2200',
  '#BB4400',
  '#996600',
  '#778800',
  '#55AA00',
  '#33CC00',
  '#11EE00',
  '#00FF00',
  '#00DD22',
  '#00BB44',
  '#009966',
  '#007788',
  '#0055AA',
  '#0033CC',
  '#0011EE',
  '#0000FF',
  '#1100EE',
  '#3300CC',
  '#5500AA',
  '#770088',
  '#990066',
  '#BB0044',
  '#DD0022',
];

export function getColor(index: number): string {
  return PRESET_COLORS[index % PRESET_COLORS.length];
}

export function getRandomColor(): string {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);
  return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
}

export function getRandomColors(count: number): string[] {
  const nonDuplicatedColors: string[] = [];
  while (nonDuplicatedColors.length < count) {
    if (nonDuplicatedColors.length === PRESET_COLORS.length) {
      nonDuplicatedColors.push(getRandomColor());
      continue;
    }

    const color = getColor(Math.floor(Math.random() * PRESET_COLORS.length));
    nonDuplicatedColors.push(color);
  }
  return nonDuplicatedColors;
}

export function reverseDirection(direction: DirectionEnum): DirectionEnum {
  const directions = [DirectionEnum.Left, DirectionEnum.Up, DirectionEnum.Right, DirectionEnum.Down];

  const index = directions.indexOf(direction);
  return directions[(index + 2) % directions.length];
}
