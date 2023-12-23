import { max } from 'ramda';

export const makeGrid = (s: string) => {
  const l = s.length;
  let i = 0;
  let row = 0;
  let col = 0;

  const results = new Map<string, string>();

  while (i < l) {
    const char = s.charAt(i);
    if (char === '\n') {
      ++row;
      col = 0;
    } else {
      results.set(`${row}, ${col}`, char);
      ++col;
    }
    ++i;
  }

  return results;
};

export const strToPoint = (s: string) => s.split(', ').map(Number) as [number, number];
export const pointToStr = ([r, c]: [number, number]) => `${r}, ${c}`;

export const findMax = (grid: Map<string, string>) =>
  [...grid.keys()]
    .map(strToPoint)
    .reduce<[number, number]>(([mr, mc], [r, c]) => [max(mr, r), max(mc, c)] as [number, number], [0, 0]);

export const getNeighbors4 = (s: string) => {
  const [r, c] = strToPoint(s);
  const ns = [
    [r - 1, c],
    [r, c + 1],
    [r + 1, c],
    [r, c - 1]
  ] as [number, number][];
  return ns.map(pointToStr);
};
