import { isNotNil } from 'ramda';

import { readFileSync } from 'node:fs';

import { aStar } from '../aStar';
import { snd } from '../fp';

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
const hills = readFileSync(new URL('./sample.txt', import.meta.url), { encoding: 'utf8' });

const createGrid = (data: string) => {
  const rows = data.split('\n');

  return rows.flatMap((row, i) => row.split('').map((v, j) => ({ height: heightMap[v], letter: v, x: i, y: j })));
};

const distanceRemaining =
  ({ x: xA, y: yA }: Point) =>
  ({ x: xB, y: yB }: Point) =>
    Math.abs(xA - xB) + Math.abs(yA - yB);

const createVertices =
  (grid: Point[]) =>
  (point: Point): Point[] => {
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

    // console.log('neighbors', neighbors);
    const canMoveTo = (pt1: Point, pt2: Point) => pt2.height - pt1.height < 2;
    return neighbors.filter((neighbor: Point) => canMoveTo(point, neighbor));
  };

describe('aStar', () => {
  it('works', () => {
    const grid = createGrid(hills);

    // let start1 = fst $ fromJust $ find (\(_, v) -> v == 'S') grid
    // let end1 = fst $ fromJust $ find (\(_, v) -> v == 'E') grid

    const start = grid.find(({ letter }) => letter === 'S')!;
    const end = grid.find(({ letter }) => letter === 'E')!;

    const r = aStar(
      createVertices(grid),
      () => 1,
      distanceRemaining(end),
      state => state === end,
      start
    )!;

    // console.log(r);

    const steps = snd(r).length;

    expect(steps).toBe(31);
  });
});
