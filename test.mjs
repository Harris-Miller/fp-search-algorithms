import { isNotNil } from 'ramda';

import { readFileSync } from 'node:fs';

// eslint-disable-next-line import/extensions
import { aStar } from './dist/index.cjs.js';

export const snd = tuple => tuple[1];

const heightMap = {
  ...'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, v, i) => ({ ...acc, [v]: i + 1 }), {}),
  E: 26,
  S: 1
};

// @ts-expect-error
const hills = readFileSync(new URL('./src/__tests__/hills.txt', import.meta.url), { encoding: 'utf8' });

const createGrid = data => {
  const rows = data.split('\n');

  return rows.flatMap((row, i) => row.split('').map((v, j) => ({ height: heightMap[v], letter: v, x: i, y: j })));
};

const distanceRemaining =
  ({ x: xA, y: yA }) =>
  ({ x: xB, y: yB }) =>
    Math.abs(xA - xB) + Math.abs(yA - yB);

const createVertices = grid => point => {
  const { x, y } = point;
  const neighborPoints = [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 }
  ];
  const neighbors = neighborPoints
    .map(({ x: nX, y: nY }) => grid.find(({ x: gX, y: gY }) => gX === nX && gY === nY))
    .filter(isNotNil);

  const canMoveTo = (pt1, pt2) => pt2.height - pt1.height < 2;
  return neighbors.filter(neighbor => canMoveTo(point, neighbor));
};

const grid = createGrid(hills);

// let start1 = fst $ fromJust $ find (\(_, v) -> v == 'S') grid
// let end1 = fst $ fromJust $ find (\(_, v) -> v == 'E') grid

const start = grid.find(({ letter }) => letter === 'S');
const end = grid.find(({ letter }) => letter === 'E');

const r = aStar(
  createVertices(grid),
  () => 1,
  distanceRemaining(end),
  state => state === end,
  start
);

const steps = snd(r).length;

console.log(steps);
