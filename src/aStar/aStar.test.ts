// eslint-disable-next-line import/no-unresolved
import { describe, expect, it } from 'bun:test';

import { readFileSync } from 'node:fs';

import { getNeighbors4, makeGrid, strToPoint } from '../__tests__/utils';

import { aStar } from './aStar';

const heightMap: Record<string, number> = {
  ...'abcdefghijklmnopqrstuvwxyz'.split('').reduce<Record<string, number>>((acc, v, i) => ({ ...acc, [v]: i + 1 }), {}),
  E: 26,
  S: 1,
};

const hills = readFileSync(new URL('./hills.txt', import.meta.url), { encoding: 'utf8' });

const grid = makeGrid(hills);

const heuristic = (aStr: string) => (bStr: string) => {
  const [aX, aY] = strToPoint(aStr);
  const [bX, bY] = strToPoint(bStr);
  return Math.abs(aX - bX) + Math.abs(aY - bY);
};

const canMoveTo = (s1: string, s2: string) => {
  const h1 = heightMap[grid.get(s1)!];
  const h2 = heightMap[grid.get(s2)!];
  return h2 - h1 < 2;
};

const next = (s: string): string[] =>
  getNeighbors4(s)
    .filter(key => grid.has(key))
    .filter(n => canMoveTo(s, n));

describe('aStar', () => {
  it('works', () => {
    // const grid = createGrid(hills);

    const asArr = [...grid.entries()];
    const [start] = asArr.find(([, letter]) => letter === 'S')!;
    const [end] = asArr.find(([, letter]) => letter === 'E')!;

    const r = aStar(
      next,
      () => 1,
      heuristic(end),
      state => state === end,
      start,
    )!;

    const [steps] = r;
    expect(steps).toBe(412);
  });
});
