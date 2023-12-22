import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getNeighbors4, makeGrid } from '../__tests__/utils';

import { breadthFirstSearch, breadthFirstTraversal } from './breadthFirst';

describe('breadth first', () => {
  test('breadthFirstTraversal', () => {
    const next = (value: string): string[] => ['1', '2'].map(v => `${value}${v}`);

    const results: string[] = [];
    for (const value of breadthFirstTraversal(next, '1')) {
      // false-positive
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      results.push(value);
      if (value === '122') break;
    }

    expect(results).toEqual(['1', '11', '12', '111', '112', '121', '122']);
  });

  test('breadthFirstSearch', () => {
    const next = (value: string): string[] => ['1', '2'].map(v => `${value}${v}`);
    const found = (value: string) => value === '122';

    const searchResults = breadthFirstSearch(next, found, '1');

    expect(searchResults).toEqual(['1', '12', '122']);
  });

  test('cheese search', () => {
    const contents = readFileSync(resolve(__dirname, 'cheeseSearch.txt'), { encoding: 'utf8' });
    const grid = makeGrid(contents);
    const walls = new Set(
      [...grid].filter(([_, v]: [string, string]) => v === '#').map(([k, _]: [string, string]) => k)
    );
    const [start, end] = [...grid]
      .filter(([_, v]: [string, string]) => v === '0' || v === '7')
      .map(([k, _]: [string, string]) => k);

    const next = (s: string) => getNeighbors4(s).filter(x => !walls.has(x));
    const found = (s: string) => s === end;

    const result = breadthFirstSearch(next, found, start);

    expect(result?.length).toBe(247);
  });
});
