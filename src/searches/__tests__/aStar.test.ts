import { describe, expect, it } from 'bun:test';

import { isEqual } from '../../helpers/isEqual';
import { aStar } from '../aStar';

import { getNeighbors4, makeGrid } from './utils';
import type { Point } from './utils';

const heightMap: Record<string, number> = {
  ...'abcdefghijklmnopqrstuvwxyz'.split('').reduce<Record<string, number>>((acc, v, i) => ({ ...acc, [v]: i + 1 }), {}),
  E: 26,
  S: 1,
};

const hills = await Bun.file(new URL('./hills.txt', import.meta.url)).text();

const grid = makeGrid(hills);

/* Manhattan */
const heuristic =
  ([aX, aY]: Point) =>
  ([bX, bY]: Point) =>
    Math.abs(aX - bX) + Math.abs(aY - bY);

const canMoveTo = (p1: Point, p2: Point) => {
  const h1 = heightMap[grid.get(p1)!];
  const h2 = heightMap[grid.get(p2)!];
  return h2 - h1 < 2;
};

const next = (p: Point): Point[] =>
  getNeighbors4(p)
    .filter(key => grid.has(key))
    .filter(n => canMoveTo(p, n));

// const getCost = (p1: Point, p2: Point) => {
//   const h1 = heightMap[grid.get(p1)!];
//   const h2 = heightMap[grid.get(p2)!];
//   return h1 > h2 ? 5 : 1;
// };

describe('aStar', () => {
  it('works', () => {
    const es = grid.entries();
    const [start] = es.find(([, letter]) => letter === 'S')!;
    const [end] = es.find(([, letter]) => letter === 'E')!;

    const r = aStar(
      next,
      () => 1,
      heuristic(end),
      state => isEqual(state, end),
      start,
    )!;
    expect(r.path.length).toBe(413);
    expect(r.cost).toBe(412);
  });
});
