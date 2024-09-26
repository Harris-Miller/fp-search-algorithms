// eslint-disable-next-line import/no-unresolved
import { describe, expect, test } from 'bun:test';

import { always, getNeighbors4, makeGrid } from '../__tests__/utils';

import { dijkstra } from './dijkstra';

describe('dijkstra', () => {
  test('cheese search', async () => {
    const url = new URL('../breadthFirst/cheeseSearch.txt', import.meta.url);
    // @ts-expect-error - false positive
    const contents = await Bun.file(url).text();
    const grid = makeGrid(contents);
    const walls = new Set([...grid].filter(([, v]: [string, string]) => v === '#').map(([k]: [string, string]) => k));
    const [start, end] = [...grid]
      .filter(([, v]: [string, string]) => v === '0' || v === '7')
      .map(([k]: [string, string]) => k);

    const next = (s: string) => getNeighbors4(s).filter(x => !walls.has(x));
    const found = (s: string) => s === end;

    const result = dijkstra(next, always(1), found, start);

    expect(result?.[0]).toBe(246);
  });
});
