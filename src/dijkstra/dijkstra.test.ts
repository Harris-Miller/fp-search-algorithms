import { always } from 'ramda';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getNeighbors4, makeGrid } from '../__tests__/utils';

import { dijkstra } from './dijkstra';

describe('dijkstra', () => {
  test('cheese search', () => {
    const contents = readFileSync(resolve(__dirname, '../breadthFirst/cheeseSearch.txt'), { encoding: 'utf8' });
    const grid = makeGrid(contents);
    const walls = new Set(
      [...grid].filter(([_, v]: [string, string]) => v === '#').map(([k, _]: [string, string]) => k)
    );
    const [start, end] = [...grid]
      .filter(([_, v]: [string, string]) => v === '0' || v === '7')
      .map(([k, _]: [string, string]) => k);

    const next = (s: string) => getNeighbors4(s).filter(x => !walls.has(x));
    const found = (s: string) => s === end;

    const result = dijkstra(next, always(1), found, start);

    expect(result?.[0]).toBe(246);
  });
});
