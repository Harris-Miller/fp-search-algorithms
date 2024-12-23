import { describe, expect, test } from 'bun:test';

import { getNeighbors4, makeGrid } from '../__tests__/utils';
import type { Point } from '../__tests__/utils';
import { HashSet } from '../structures/hashSet';
import { isEqual } from '../utils/isEqual';

import { breadthFirstSearch, breadthFirstTraversal } from './breadthFirst';

describe('breadth first', () => {
  test('breadthFirstTraversal', () => {
    const next = (value: string): string[] => ['1', '2'].map(v => `${value}${v}`);

    const results: string[] = [];
    for (const [value] of breadthFirstTraversal(next, '1')) {
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
    const walls = new HashSet(
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

    const result = breadthFirstSearch(next, found, start);

    expect(result?.[1].length).toBe(247);
  });
});
