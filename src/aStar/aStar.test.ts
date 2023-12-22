import { indexBy, isNotNil, toString } from 'ramda';

import { readFileSync } from 'node:fs';

import { aStar } from './aStarPure';

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

// @ts-expect-error
const hills = readFileSync(new URL('./hills.txt', import.meta.url), { encoding: 'utf8' });

const createGrid = (data: string) => {
  const rows = data.split('\n');

  return rows.flatMap((row, i) => row.split('').map((v, j) => ({ height: heightMap[v], letter: v, x: i, y: j })));
};

const heuristic = (a: Point) => (b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

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

describe('aStar', () => {
  it('works', () => {
    const grid = createGrid(hills);

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

    console.log(r);

    const steps = r?.[0];

    expect(steps).toBe(412);
  });
});
