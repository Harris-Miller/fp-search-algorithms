/* eslint-disable @typescript-eslint/prefer-return-this-type */
/* eslint-disable no-underscore-dangle */

import { createEmptyNode, find, insert, remove, traverse } from './internal/balancedTree';
import type { Node } from './internal/balancedTree';

export class OrderedMap<K, V> {
  private root: Node<K, V> | undefined;
  private _size: number;

  constructor(iterable?: Iterable<readonly [K, V]> | null) {
    this.root = undefined;
    this._size = 0;
    if (iterable != null) {
      for (const [k, v] of iterable) {
        this.set(k, v);
      }
    }
  }

  set(key: K, val: V): OrderedMap<K, V> {
    const addedLeaf = { val: false };
    const root = this.root ?? createEmptyNode();
    this.root = insert(root, key, val, addedLeaf);
    this._size = addedLeaf.val ? this._size + 1 : this._size;
    return this;
  }

  has(key: K): boolean {
    if (this.root === undefined) return false;
    return find(this.root, key) !== undefined;
  }

  get(key: K): V | undefined {
    if (this.root === undefined) return undefined;
    const found = find(this.root, key);
    return found?.[1];
  }

  delete(key: K): boolean {
    if (this.root === undefined) return false;
    if (!this.has(key)) return false;

    remove(this.root, key);
    this._size -= 1;

    return true;
  }

  entries() {
    return Iterator.from(this.root !== undefined ? traverse(this.root) : []);
  }

  keys() {
    return this.entries().map(([k]) => k);
  }
}
