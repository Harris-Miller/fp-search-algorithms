import { describe, expect, it } from 'bun:test';

import { HashSet } from '../hashSet';

describe('class HashSet', () => {
  describe('method delete', () => {
    it('removes final entry', () => {
      const set = new HashSet<number>();
      set.add(1);
      set.delete(1);
      expect(set.size).toBe(0);
    });
  });
});
