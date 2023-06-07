import { indexBy, isNotNil, toString } from 'ramda';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { aStar } from './src/aStar';
import { snd } from './src/fp';

type Point = {
  height: number;
  letter: string;
  x: number;
  y: number;
};

const heightMap: Record<string, number> = {
  ...'abcdefghijklmnopqrstuvwxyz'.split('').reduce<Record<string, number>>((acc, v, i) => ({ ...acc, [v]: i + 1 }), {}),
  E: 26,
  S: 1
};

const hills = readFileSync(resolve(__dirname, './src/__tests__/hills.txt'), { encoding: 'utf8' });

const createGrid = (data: string) => {
  const rows = data.split('\n');

  return rows.flatMap((row, i) => row.split('').map((v, j) => ({ height: heightMap[v], letter: v, x: i, y: j })));
};

const heuristic =
  ({ x: xA, y: yA }: Point) =>
  ({ x: xB, y: yB }: Point) =>
    Math.abs(xA - xB) + Math.abs(yA - yB);

const canMoveTo = (pt1: Point, pt2: Point) => pt2.height - pt1.height < 2;

const makeNext =
  (gridKeyMap: Record<string, Point>) =>
  (point: Point): Point[] => {
    const { x, y } = point;
    const neighborKeys = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 }
    ].map(toString);
    const neighbors = neighborKeys.map(k => gridKeyMap[k]).filter(isNotNil);

    return neighbors.filter((neighbor: Point) => canMoveTo(point, neighbor));
  };

const grid = createGrid(hills);

// grid.forEach(a => console.log(a));

const start = grid.find(({ letter }) => letter === 'S')!;
const end = grid.find(({ letter }) => letter === 'E')!;

const gridKeyMap = indexBy(({ x, y }) => toString({ x, y }), grid);

const r = aStar(
  makeNext(gridKeyMap),
  () => 1,
  heuristic(end),
  state => state === end,
  start
)!;

const steps = snd(r).length;

console.log(steps);
