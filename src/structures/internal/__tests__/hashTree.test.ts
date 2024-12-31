import { describe, expect, it } from 'bun:test';

import { getHash } from '../hashing';
import type { Node } from '../hashTree';
import { assoc, createEmptyNode } from '../hashTree';

describe('hashTree', () => {
  it('works as expected', () => {
    let root: Node<string, number> = createEmptyNode();
    expect(root.array.length).toBe(0);

    root = assoc(root, 0, getHash('foo'), 'foo', 0, { val: false });
    root = assoc(root, 0, getHash('bar'), 'bar', 1, { val: false });

    expect(root.array.length).toBe(2);
  });
});
