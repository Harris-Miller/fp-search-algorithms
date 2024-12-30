import { describe, expect, it } from 'bun:test';

import { HashMap } from '../../structures/hashMap';
import { yenAssoc } from '../yen';

const costs = new HashMap<[string, string], number>([
  [['c', 'd'], 3],
  [['c', 'e'], 2],
  [['d', 'f'], 4],
  [['e', 'd'], 1],
  [['e', 'f'], 2],
  [['e', 'g'], 3],
  [['f', 'g'], 2],
  [['f', 'h'], 1],
  [['g', 'h'], 2],
]);

// const edges = costs.keys().toArray();

const next = (state: string) =>
  costs
    .entries()
    .filter(([[from]]) => from === state)
    .map<[string, number]>(([[, to], c]) => [to, c])
    .toArray();

// const getCost = (to: string, from: string) => costs.get([to, from])!;

const found = (state: string) => state === 'h';

describe('yen', () => {
  it('works', () => {
    const result = yenAssoc(next, found, 'c', 3);
    expect(result).toEqual([
      { cost: 5, path: ['c', 'e', 'f', 'h'] },
      { cost: 5, path: ['c', 'e', 'g', 'h'] },
      { cost: 6, path: ['c', 'e', 'f', 'g', 'h'] },
    ]);
  });
});
