// eslint-disable-next-line import/no-unresolved
import { describe, expect, test } from 'bun:test';

import { depthFirstSearch, depthFirstTraversal } from './depthFirst';

type Tree<T> = { children: Tree<T>[]; value: T };

const tree: Tree<string> = {
  children: [
    {
      children: [
        { children: [], value: '111' },
        { children: [], value: '112' },
      ],
      value: '11',
    },
    {
      children: [
        { children: [], value: '121' },
        { children: [], value: '122' },
      ],
      value: '12',
    },
  ],
  value: '1',
};

describe('depth first search', () => {
  test('generator function', () => {
    const next = ({ children }: Tree<string>) => children;

    const genResults = [...depthFirstTraversal(next, tree)].map(x => x[0].value);

    expect(genResults).toEqual(['1', '11', '111', '112', '12', '121', '122']);
  });

  test('search function', () => {
    const next = ({ children }: Tree<string>) => children;
    const found = ({ value }: Tree<string>) => value === '122';

    const searchResults = depthFirstSearch(next, found, tree)?.[1].map(x => x.value);

    expect(searchResults).toEqual(['1', '12', '122']);
  });
});
