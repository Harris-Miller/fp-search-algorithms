// eslint-disable-next-line import/no-unresolved
import { describe, expect, test } from 'bun:test';

import { getNeighbors4, makeGrid } from '../__tests__/utils';

import { breadthFirstSearch, breadthFirstTraversal } from './breadthFirst';

describe('breadth first', () => {
  test('breadthFirstTraversal', () => {
    const next = (value: string): string[] => ['1', '2'].map(v => `${value}${v}`);

    const results: string[] = [];
    for (const [value] of breadthFirstTraversal(next, '1')) {
      // false-positive

      results.push(value);
      if (value === '122') break;
    }

    expect(results).toEqual(['1', '11', '12', '111', '112', '121', '122']);
  });

  test('breadthFirstSearch', () => {
    const next = (value: string): string[] => ['1', '2'].map(v => `${value}${v}`);
    const found = (value: string) => value === '122';

    const searchResults = breadthFirstSearch(next, found, '1');

    expect(searchResults?.[1]).toEqual(['1', '12', '122']);
  });

  test('cheese search', async () => {
    const url = new URL('./cheeseSearch.txt', import.meta.url);
    const contents = await Bun.file(url).text();
    const grid = makeGrid(contents);
    const walls = new Set([...grid].filter(([, v]: [string, string]) => v === '#').map(([k]: [string, string]) => k));
    const [start, end] = [...grid]
      .filter(([, v]: [string, string]) => v === '0' || v === '7')
      .map(([k]: [string, string]) => k);

    const next = (s: string) => getNeighbors4(s).filter(x => !walls.has(x));
    const found = (s: string) => s === end;

    const result = breadthFirstSearch(next, found, start);

    expect(result?.[1].length).toBe(247);
  });
});
