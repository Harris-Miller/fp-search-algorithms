/* eslint-disable @typescript-eslint/prefer-return-this-type */

import type { Node } from './internal/balancedTree2';
import { insert, lookup, remove, traverse } from './internal/balancedTree2';

export class OrderedMap<K, V> {
  private root: Node<K, V> | undefined = undefined;

  constructor(iterable?: Iterable<readonly [K, V]> | null) {
    if (iterable != null) {
      for (const [k, v] of iterable) {
        this.set(k, v);
      }
    }
  }

  set(key: K, val: V): OrderedMap<K, V> {
    this.root = insert(key, val, this.root);
    return this;
  }

  has(key: K): boolean {
    if (this.root === undefined) return false;
    return lookup(key, this.root) !== undefined;
  }

  get(key: K): V | undefined {
    if (this.root === undefined) return undefined;
    return lookup(key, this.root)?.[1];
  }

  delete(key: K): boolean {
    if (this.root === undefined) return false;
    if (!this.has(key)) return false;

    this.root = remove(key, this.root);

    return true;
  }

  entries() {
    return Iterator.from(traverse(this.root));
  }

  keys() {
    return this.entries().map(([k]) => k);
  }
}
