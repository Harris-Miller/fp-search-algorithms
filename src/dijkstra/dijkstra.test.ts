import { describe, expect, test } from 'bun:test';

import { always, getNeighbors4, makeGrid } from '../__tests__/utils';
import type { Point } from '../__tests__/utils';
import { DSet } from '../structures/dSet';
import { isEqual } from '../utils/isEqual';

import { dijkstra } from './dijkstra';

describe('dijkstra', () => {
  test('cheese search', async () => {
    const url = new URL('../breadthFirst/cheeseSearch.txt', import.meta.url);
    const contents = await Bun.file(url).text();
    const grid = makeGrid(contents);
    const walls = new DSet(
      grid
        .entries()
        .filter(([, v]) => v === '#')
        .map(([k]) => k),
    );
    const [start, end] = grid
      .entries()
      .filter(([, v]) => v === '0' || v === '7')
      .map(([k]) => k);

    const next = (p: Point) => getNeighbors4(p).filter(x => !walls.has(x));
    const found = (p: Point) => isEqual(p, end);

    const result = dijkstra(next, always(1), found, start);

    expect(result[0]).toBe(246);
  });
});
