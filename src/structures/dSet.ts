/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable @typescript-eslint/prefer-return-this-type */
/* eslint-disable no-plusplus */
import { Dict } from './dict';

/**
 * An implementation of Set backed by Dict
 * Values can be anything, with deep-equality comparison
 * API compatible with native Set
 */
export class DSet<V> implements Iterable<V> {
  static from<V>(): DSet<V>;
  static from<V>(array: readonly V[]): DSet<V>;

  static from<V>(set: Set<V>): DSet<V>;
  static from<V>(oneOfThem?: unknown): DSet<V> {
    if (oneOfThem == null) {
      return new DSet<V>();
    }

    if (oneOfThem instanceof Set) {
      const ds = new DSet<V>();
      (oneOfThem as Set<V>).forEach(v => {
        ds.add(v);
      });
      return ds;
    }

    // else must be array
    const ds = new DSet<V>();
    for (let i = 0; i < (oneOfThem as V[]).length; i++) {
      const v = (oneOfThem as V[])[i];
      ds.add(v);
    }
    return ds;
  }

  private dict: Dict<V, undefined>;

  constructor();
  constructor(values: readonly V[] | null);
  constructor(iterable: Iterable<V> | null);
  constructor(iterable?: Iterable<V> | null) {
    this.dict = new Dict<V, undefined>();
    if (iterable != null) {
      for (const v of iterable) {
        this.add(v);
      }
    }
  }

  //
  // Set API
  //

  add(val: V): DSet<V> {
    this.dict.set(val, undefined);
    return this;
  }

  clear(): void {
    this.dict.clear();
  }

  delete(val: V): DSet<V> {
    this.dict.delete(val);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  difference(other: DSet<V>): DSet<V> {
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
  intersection(other: DSet<V>): DSet<V> {
    throw new Error('not yet implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isDisjointFrom(other: DSet<V>): boolean {
    throw new Error('not yet implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isSubsetOf(other: DSet<V>): boolean {
    throw new Error('not yet implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isSupersetOf(other: DSet<V>): boolean {
    throw new Error('not yet implemented');
  }

  keys() {
    return this.dict.keys();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  symmetricDifference(other: DSet<V>): DSet<V> {
    throw new Error('not yet implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  union(other: DSet<V>): DSet<V> {
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

  equals(o: DSet<V>): boolean {
    return this.dict.equals(o.dict);
  }
}
