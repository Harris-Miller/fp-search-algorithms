/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable @typescript-eslint/prefer-return-this-type */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */

//
// Credit to: https://github.com/gleam-lang/stdlib/blob/main/src/dict.mjs
// Ported to typescript
//

import { getHash, hashMerge } from '../internal/hashing';
import type { IndexNode, Node } from '../internal/hashTree';
import { assoc, EMPTY, find, forEach, toArray, without } from '../internal/hashTree';
import { isEqual } from '../utils/isEqual';

// This is thrown internally in Dict.equals() so that it returns false as soon
// as a non-matching key is found
// eslint-disable-next-line symbol-description
const unequalDictSymbol = Symbol();

/**
 * An implementation of the native Map, but with deep-equality key comparison
 * API compatible with native Map, with exception of constructor
 * IN addition, a static Dict.from() function allows for additional conversions including objects and Maps
 * Note: Unlike Map, order of insertion is not retained for iteration methods
 *
 * @public
 * @category Structures
 */
export class HashMap<K, V> implements Iterable<[K, V]> {
  /**
   * A function constructor that handles an EntriesArray, Object, or native Map
   */
  static from<K, V>(): HashMap<K, V>;
  static from<V>(object: Record<string, V>): HashMap<string, V>;
  static from<K, V>(map: Map<K, V>): HashMap<string, V>;

  static from<K, V>(entries: Iterable<readonly [K, V]>): HashMap<string, V>;
  static from<K, V>(oneOfThem?: unknown): HashMap<K, V> {
    if (oneOfThem == null) {
      return new HashMap<K, V>();
    }

    if (oneOfThem instanceof Map) {
      const dict = new HashMap<K, V>();
      (oneOfThem as Map<K, V>).forEach((v, k) => {
        dict.set(k, v);
      });
      return dict;
    }

    if (Array.isArray(oneOfThem)) {
      return new HashMap<K, V>(oneOfThem);
    }

    // else isObject
    const keys = Object.keys(oneOfThem as Record<string, V>);
    const dict = new HashMap<string, V>();
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      dict.set(k, (oneOfThem as Record<string, V>)[k]);
    }
    return dict as HashMap<K, V>;
  }

  static groupBy<K, V>(items: Iterable<V>, keySelector: (item: V, index: number) => K): HashMap<K, V[]> {
    const dict = new HashMap<K, V[]>();
    let i = 0;
    for (const val of items) {
      const key = keySelector(val, i);
      if (!dict.has(key)) {
        dict.set(key, []);
      }
      dict.get(key)!.push(val);
      ++i;
    }
    return dict;
  }

  private root: Node<K, V> | undefined;
  private sizeInternal: number;

  constructor();
  constructor(iterable: Iterable<readonly [K, V]> | null);
  constructor(iterable?: Iterable<readonly [K, V]> | null) {
    this.root = undefined;
    this.sizeInternal = 0;
    if (iterable != null) {
      for (const [k, v] of iterable) {
        this.set(k, v);
      }
    }
  }

  //
  // Map API
  //

  clear(): void {
    this.root = undefined;
    this.sizeInternal = 0;
  }

  delete(key: K): boolean {
    if (this.root === undefined) {
      return false;
    }
    const newRoot = without(this.root, 0, getHash(key), key);
    if (newRoot === this.root) {
      return false;
    }
    if (newRoot === undefined) {
      return false;
    }
    this.root = newRoot;
    this.sizeInternal -= 1;

    const m = new Map();
    m.entries();

    return true;
  }

  entries() {
    return Iterator.from(toArray(this.root));
  }

  forEach(fn: (val: V, key: K) => void) {
    forEach(this.root, fn);
  }

  get(key: K): V | undefined {
    if (this.root === undefined) {
      return undefined;
    }
    const found = find(this.root, 0, getHash(key), key);
    if (found === undefined) {
      return undefined;
    }
    return found.v;
  }

  has(key: K): boolean {
    if (this.root === undefined) {
      return false;
    }
    return find(this.root, 0, getHash(key), key) !== undefined;
  }

  keys() {
    return this.entries().map(([k]) => k);
  }

  set(key: K, val: V): HashMap<K, V> {
    const addedLeaf = { val: false };
    const root = this.root ?? (EMPTY as IndexNode<K, V>);
    const newRoot = assoc(root, 0, getHash(key), key, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    this.root = newRoot;
    this.sizeInternal = addedLeaf.val ? this.sizeInternal + 1 : this.sizeInternal;
    return this;
  }

  values() {
    return this.entries().map(([, v]) => v);
  }

  get size(): number {
    return this.sizeInternal;
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  //
  // Additional API
  //

  hashCode(): number {
    let h = 0;
    this.forEach((v, k) => {
      h = (h + hashMerge(getHash(v), getHash(k))) | 0;
    });
    return h;
  }

  clone(): HashMap<K, V> {
    const dict = new HashMap<K, V>();
    dict.root = structuredClone(this.root);
    return dict;
  }

  equals(other: HashMap<K, V>): boolean {
    if (!(other instanceof HashMap) || this.sizeInternal !== other.sizeInternal) {
      return false;
    }

    try {
      this.forEach((v, k) => {
        if (!isEqual(other.get(k), v)) {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw unequalDictSymbol;
        }
      });
      return true;
    } catch (e) {
      if (e === unequalDictSymbol) {
        return false;
      }

      throw e;
    }
  }

  map<U>(callbackFn: (val: V, key: K) => U): HashMap<K, U> {
    const dict = new HashMap<K, U>();
    this.forEach((v, k) => {
      dict.set(k, callbackFn(v, k));
    });
    return dict;
  }

  filter<S extends V>(predicate: (value: V, key: K) => value is S): HashMap<K, S>;
  filter(predicate: (value: V, key: K) => boolean): HashMap<K, V>;
  filter(predicate: (value: V, key: K) => boolean): HashMap<K, V> {
    const dict = new HashMap<K, V>();
    this.forEach((v, k) => {
      if (predicate(v, k)) {
        dict.set(k, v);
      }
    });
    return dict;
  }

  find<S extends V>(predicate: (value: V, key: K) => value is S): [K, S] | undefined;
  find(predicate: (value: V, key: K) => boolean): [K, V] | undefined;
  find(predicate: (value: V, key: K) => boolean): [K, V] | undefined {
    for (const [k, v] of this.entries()) {
      if (predicate(v, k)) {
        return [k, v];
      }
    }
    return undefined;
  }

  reduce(callbackFn: (accumulator: V, value: V, key: K) => V): V;
  reduce<U>(callbackFn: (accumulator: U, value: V, key: K) => U, initialValue: U): U;
  reduce<U>(
    callbackFn: (accumulator: NonNullable<U>, value: V, key: K) => NonNullable<U>,
    initialValue?: U,
  ): NonNullable<U> {
    let acc = initialValue ?? (this.values().take(1).toArray()[0] as NonNullable<U>);
    const iterator = initialValue === undefined ? this.entries().drop(1) : this.entries();
    for (const [k, v] of iterator) {
      acc = callbackFn(acc, v, k);
    }
    return acc;
  }

  some(predicate: (value: V, key: K) => boolean): boolean {
    for (const [k, v] of this.entries()) {
      if (predicate(v, k)) return true;
    }
    return false;
  }

  every(predicate: (value: V, key: K) => boolean): boolean {
    for (const [k, v] of this.entries()) {
      if (!predicate(v, k)) return false;
    }
    return true;
  }
}
