import { indexBy, isNotNil, toString } from 'ramda';

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
const data = readFileSync(new URL('./src/__tests__/hills.txt', import.meta.url), { encoding: 'utf8' });

const createGrid = rows =>
  rows.flatMap((row, i) => row.split('').map((v, j) => ({ height: heightMap[v], letter: v, x: i, y: j })));

const heuristic =
  ({ x: xA, y: yA }) =>
  ({ x: xB, y: yB }) =>
    Math.abs(xA - xB) + Math.abs(yA - yB);

const canMoveTo = pt1 => pt2 => pt2.height - pt1.height < 2;

const isInBounds =
  (xMax, yMax) =>
  ({ x, y }) =>
    x >= 0 && x <= xMax && y >= 0 && y <= yMax;

const makeNext = (xMax, yMax, gridKeyMap) => point => {
  const { x, y } = point;
  const neighborKeys = [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 }
  ].map(toString);

  const r = neighborKeys
    .map(k => gridKeyMap[k])
    .filter(isNotNil)
    .filter(isInBounds(xMax, yMax))
    .filter(canMoveTo(point));

  // console.log(r);

  return r;
};

const rows = data.split('\n');

const grid = createGrid(rows);

// console.log(grid);

const start = grid.find(({ letter }) => letter === 'S');
const end = grid.find(({ letter }) => letter === 'E');

const gridKeyMap = indexBy(({ x, y }) => toString({ x, y }), grid);

// console.log(gridKeyMap);

const xMax = rows.length - 1;
const yMax = rows[0].length - 1;

const r = aStar(
  makeNext(xMax, yMax, gridKeyMap),
  () => 1,
  heuristic(end),
  state => state === end,
  start
);

const steps = snd(r).length;

console.log(steps);
