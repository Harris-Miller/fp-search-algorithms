/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable @typescript-eslint/prefer-return-this-type */

import { HashMap } from './hashMap';

/**
 * An implementation of Set backed by Dict
 * Values can be anything, with deep-equality comparison
 * API compatible with native Set
 * Note: Unlike Set, order of insertion is not retained for iteration methods
 *
 * @public
 * @category Structures
 */
export class HashSet<V> implements Iterable<V> {
  private dict: HashMap<V, undefined>;

  /**
   * A function constructor that handles a native Set, a values array, or an iterable
   * @group Constructors
   */
  static from<V>(): HashSet<V>;
  static from<V>(set: Set<V>): HashSet<V>;
  static from<V>(values: readonly V[]): HashSet<V>;
  static from<V>(iterable: Iterable<V>): HashSet<V>;
  static from<V>(oneOfThem?: Iterable<V> | Set<V> | readonly V[]): HashSet<V> {
    return new HashSet<V>(oneOfThem);
  }

  constructor();
  constructor(values?: readonly V[] | null);
  constructor(iterable?: Iterable<V> | null);
  constructor(iterable?: Iterable<V> | null) {
    this.dict = new HashMap<V, undefined>();
    if (iterable != null) {
      for (const v of iterable) {
        this.add(v);
      }
    }
  }

  //
  // Set API
  //

  add(val: V): HashSet<V> {
    this.dict.set(val, undefined);
    return this;
  }

  clear(): void {
    this.dict.clear();
  }

  delete(val: V): boolean {
    return this.dict.delete(val);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  difference(other: HashSet<V>): HashSet<V> {
    throw new Error('not yet implemented');
  }

  entries() {
    return this.dict.keys().map(k => [k, k]);
  }

  forEach(fn: (val: V) => void): void {
    this.dict.forEach((_v, k) => {
      fn(k);
    });
  }

  has(val: V): boolean {
    return this.dict.has(val);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  intersection(other: HashSet<V>): HashSet<V> {
    throw new Error('not yet implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isDisjointFrom(other: HashSet<V>): boolean {
    throw new Error('not yet implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isSubsetOf(other: HashSet<V>): boolean {
    throw new Error('not yet implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isSupersetOf(other: HashSet<V>): boolean {
    throw new Error('not yet implemented');
  }

  keys() {
    return this.dict.keys();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  symmetricDifference(other: HashSet<V>): HashSet<V> {
    throw new Error('not yet implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  union(other: HashSet<V>): HashSet<V> {
    throw new Error('not yet implemented');
  }

  values() {
    return this.dict.keys();
  }

  [Symbol.iterator]() {
    return this.keys();
  }

  get size() {
    return this.dict.size;
  }

  //
  // Additional API
  //

  hashCode(): number {
    return this.dict.hashCode();
  }

  clone(): HashSet<V> {
    const set = new HashSet<V>();
    set.dict = this.dict.clone();
    return set;
  }

  equals(other: HashSet<V>): boolean {
    return this.dict.equals(other.dict);
  }

  map<U>(callbackFn: (val: V) => U): HashSet<U> {
    const set = new HashSet<U>();
    this.forEach(v => {
      set.add(callbackFn(v));
    });
    return set;
  }

  filter<S extends V>(predicate: (value: V) => value is S): HashSet<S>;
  filter(predicate: (value: V) => boolean): HashSet<V>;
  filter(predicate: (value: V) => boolean): HashSet<V> {
    const set = new HashSet<V>();
    this.forEach(v => {
      if (predicate(v)) {
        set.add(v);
      }
    });
    return set;
  }

  find<S extends V>(predicate: (value: V) => value is S): S | undefined;
  find(predicate: (value: V) => boolean): V | undefined;
  find(predicate: (value: V) => boolean): V | undefined {
    for (const v of this.values()) {
      if (predicate(v)) {
        return v;
      }
    }
    return undefined;
  }

  reduce(callbackFn: (accumulator: V, value: V) => V): V;
  reduce<U>(callbackFn: (accumulator: U, value: V) => U, initialValue: U): U;
  reduce<U>(callbackFn: (accumulator: NonNullable<U>, value: V) => NonNullable<U>, initialValue?: U): NonNullable<U> {
    let acc = initialValue ?? (this.values().take(1).toArray()[0] as NonNullable<U>);
    const iterator = initialValue === undefined ? this.values().drop(1) : this.values();
    for (const v of iterator) {
      acc = callbackFn(acc, v);
    }
    return acc;
  }

  some(predicate: (value: V) => boolean): boolean {
    for (const v of this.values()) {
      if (predicate(v)) return true;
    }
    return false;
  }

  every(predicate: (value: V) => boolean): boolean {
    for (const v of this.values()) {
      if (!predicate(v)) return false;
    }
    return true;
  }
}
