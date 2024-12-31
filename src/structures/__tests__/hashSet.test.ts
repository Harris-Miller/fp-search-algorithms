import { describe, expect, it } from 'bun:test';

import { HashSet } from '../hashSet';

describe('class HashSet', () => {
  describe('constructors', () => {
    // TODO
  });

  describe('utility', () => {
    // TODO
  });

  describe('mutations', () => {
    describe('method delete', () => {
      it('removes final entry', () => {
        const set = new HashSet<number>();
        set.add(1);
        set.delete(1);
        expect(set.size).toBe(0);
      });
    });
  });

  describe('iterables', () => {
    // TODO
  });

  describe('composition', () => {
    describe('method difference', () => {
      it('MDN examples', () => {
        const odds = new Set([1, 3, 5, 7, 9]);
        const squares = new Set([1, 4, 9]);

        const hsOdds = new HashSet(odds);
        const hsSquares = new HashSet(squares);

        const diffExpect = odds.difference(squares);
        const hsDiff = hsOdds.difference(hsSquares);

        expect(hsDiff.values().toArray()).toContainAllValues(diffExpect.values().toArray());
      });
    });

    describe('method intersection', () => {
      it('MDN examples', () => {
        const odds = new Set([1, 3, 5, 7, 9]);
        const squares = new Set([1, 4, 9]);

        const hsOdds = new HashSet(odds);
        const hsSquares = new HashSet(squares);

        const diffExpect = odds.intersection(squares);
        const hsDiff = hsOdds.intersection(hsSquares);

        expect(hsDiff.values().toArray()).toContainAllValues(diffExpect.values().toArray());
      });
    });

    describe('method isDisjointFrom', () => {
      it('MDN examples', () => {
        const primes = new HashSet([2, 3, 5, 7, 11, 13, 17, 19]);
        const squares = new HashSet([1, 4, 9, 16]);
        expect(primes.isDisjointFrom(squares)).toBeTrue();
      });
    });
  });

  describe('reductions', () => {
    // TODO
  });
});
