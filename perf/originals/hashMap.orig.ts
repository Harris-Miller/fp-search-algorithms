/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable @typescript-eslint/prefer-return-this-type */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */

//
// Credit to: https://github.com/gleam-lang/stdlib/blob/main/src/dict.mjs
// Ported to typescript
//

import { isEqual } from '../../src/helpers/isEqual';
import { getHash, hashMerge } from '../../src/structures/internal/hashing';

import type { Node } from './hashTree.orig';
import { assoc, EMPTY, find, forEach, toArray, without } from './hashTree.orig';

/**
 * ### HashMap
 *
 * Key equality is calculated by a hashing algorithm:
 * * Functions, Symbols, Promises, WeakMaps, and WeakSets are by reference
 * * Primitives are checked by value
 * * All others keys (objects) are checked by structure (commonly known as deep-equality checking)
 * * [Full details](https://github.com/Harris-Miller/fp-search-algorithms?tab=readme-ov-file#fp-search-algorithms)
 *
 * If your keys are Javascript [primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), there is no benefit in using a HashMap over the native [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
 *
 * #### Construction
 * `HashMap` is a newable class, and has the static `HashMap.from` functional constructor for convenience
 *
 * #### Native Map API
 * The HashMap API fully implements the Map API and can act as a drop-in replacement with a few caveats:
 * * Non-primitive Map keys are equal by reference, a Map may contain two different keys that share the same structure. A HashMap will not see those keys as being different
 * * Order of insertion is not retained
 *
 * Those methods are:
 * * `clear`, `delete`, `entries`, `forEach`, `get`, `has`, `keys`, `set`, `values`, `[Symbol.Iterator]`
 * * static `groupBy`
 * * readonly prop `size`
 *
 * #### Array API
 * HashMap partially implements the Array API, specifically the reduction methods that can apply. Their function signatures match their array equivalent with `k: Key` replacing `index: number`
 *
 * Those methods are:
 * * `map`, `filter`, `find`, `reduce`, `some`, `every`
 * * Notes:
 *   * `map` and `filter` are immutable, returning a new instance of HashMap
 *   * `find` returns a tuple `[K, V] | undefined`
 *
 * #### Additional Utility APIs
 * * `clone` - will return a new instance of a HashMap with the exact same key/value pair entries
 * * `equals` - determine if another HashMap "is equal" to `this` by determining they share the same key/value pair entries
 * * Therefor `hashMap.equals(hashMap.clone())` will always return `true`
 *
 * #### Hashing
 * When using non-primitives as a key, those objects (arrays, object literals, instances of a class, instances of Maps, Sets, etc...) are hashed based on their internal structure.
 * This means 2 separate object literals `{ x: 1, y: 2 }` will always result in the same "key"
 *
 * Note the following exceptions, which are keyed by reference:
 * * any function, any symbol, any instance of a WeakMap or WeakSet
 *
 * If the prop `hashCode` is found on the return of `Object.getPrototypeOf(key)` and is a function that returns a number,
 * that will be called with a single argument of itself, its return value used as its hash.
 * Implement `hashCode` for any class that may have special considerations when determining the hash for, eg private props via `#` syntax.
 *
 * @category Structures
 */
export class HashMap<K, V> implements Iterable<[K, V]> {
  private root: Node<K, V> | undefined;
  private _size: number;

  //#region Constructors

  /**
   * Create a HashMap from a Map.
   *
   * Note: If your Map has non-primitive keys that do not equal by reference but deep-equal by structure, only they last key/value pair will retain in the HashMap.
   *
   * @group Constructors
   */
  static from<K, V>(map: Map<K, V>): HashMap<K, V>;
  /**
   * Create a HashMap from an Array of Entries.
   *
   * Note: If any `key` in `[key, value]` is a non-primitive and their are multiples that do not equal by reference but deep-equal by structure, only they last key/value pair will retain in the HashMap.
   *
   * @group Constructors
   */
  static from<K, V>(entries: readonly [K, V][]): HashMap<K, V>;
  /**
   * Create a HashMap from an Iterable of Entries.
   *
   * Note: If any `key` in `[key, value]` is a non-primitive and their are multiples that do not equal by reference but deep-equal by structure, only they last key/value pair will retain in the HashMap.
   *
   * @group Constructors
   */
  static from<K, V>(iterable: Iterable<readonly [K, V]>): HashMap<K, V>;
  /**
   * Create a HashMap from an Object.
   *
   * Note: key/value pairs are created from the result of passing the argument to `Object.entries`.
   *
   * @group Constructors
   */
  static from<V>(object: Record<PropertyKey, V>): HashMap<string, V>;
  static from<K, V>(oneOfThem?: Iterable<readonly [K, V]> | Record<string, V>): HashMap<K, V> {
    if (oneOfThem == null) {
      return new HashMap<K, V>();
    }

    if (Symbol.iterator in oneOfThem) {
      return new HashMap<K, V>(oneOfThem);
    }

    // else isObject
    return new HashMap<K, V>(Object.entries(oneOfThem) as [K, V][]);
  }

  /**
   * Create an empty HashMap.
   */
  constructor();
  /**
   * Create a HashMap from an Array of Entries.
   *
   * Note: If any `key` in `[key, value]` is a non-primitive and their are multiples that do not equal by reference but deep-equal by structure, only they last key/value pair will retain in the HashMap.
   */
  constructor(entries?: readonly (readonly [K, V])[] | null);
  /**
   * Create a HashMap from an Iterable of Entries.
   *
   * Note: If any `key` in `[key, value]` is a non-primitive and their are multiples that do not equal by reference but deep-equal by structure, only they last key/value pair will retain in the HashMap.
   */
  constructor(iterable?: Iterable<readonly [K, V]> | null);
  constructor(iterable?: Iterable<readonly [K, V]> | null) {
    this.root = undefined;
    this._size = 0;
    if (iterable != null) {
      for (const [k, v] of iterable) {
        this.set(k, v);
      }
    }
  }

  //#endregion

  //#region Utility

  /**
   * Groups members of an iterable according to the return value of the passed callback.
   * @group Utility
   * @param items An iterable.
   * @param keySelector A callback which will be invoked for each item in items.
   */
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

  /**
   * @group Utility
   * @returns an immutable copy of the HashMap
   */
  clone(): HashMap<K, V> {
    const clone = new HashMap<K, V>();
    clone.root = structuredClone(this.root);
    clone._size = this.size;
    return clone;
  }

  /**
   * Check if this HashMap is equal to another
   * Returns `true` when
   * * referentially equal
   * * both HashMaps contain exactly the same key/value pairs
   * * both are empty
   *
   * @group Utility
   * @param other another HashMap
   * @returns boolean indicating whether the other HashMap has the exactly same entries as this
   */
  equals(other: HashMap<K, V>): boolean {
    if (this === other) return true;
    if (!(other instanceof HashMap) || this._size !== other._size) return false;

    for (const [k, v] of this) {
      if (!isEqual(other.get(k), v)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Used internally by `isEqual`
   * @group Utility
   * @returns the hash of this HashMap
   */
  private hashCode(): number {
    let h = 0;
    this.forEach((v, k) => {
      h = (h + hashMerge(getHash(v), getHash(k))) | 0;
    });
    return h;
  }

  //#endregion

  //#region Entries

  /**
   * @group Entries
   * @returns the number of elements in the HashMap.
   */
  get size(): number {
    return this._size;
  }

  /**
   * Empties the HashMap, clearing out all entries
   * @group Entries
   */
  clear(): void {
    this.root = undefined;
    this._size = 0;
  }

  /**
   * @group Entries
   * @returns true if an element in the HashMap existed and has been removed, or false if the element does not exist.
   */
  delete(key: K): boolean {
    if (this.root === undefined) {
      return false;
    }
    const newRoot = without(this.root, 0, getHash(key), key);
    if (newRoot === this.root) {
      return false;
    }

    this.root = newRoot;
    this._size -= 1;

    return true;
  }

  /**
   * Executes a provided function once per each key/value pair in the Map, in insertion order.
   * @group Entries
   */
  forEach(fn: (val: V, key: K) => void) {
    forEach(this.root, fn);
  }

  /**
   * Returns a specified element from the HashMap. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the HashMap.
   * @group Entries
   * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
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

  /**
   * @group Entries
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key: K): boolean {
    if (this.root === undefined) {
      return false;
    }
    return find(this.root, 0, getHash(key), key) !== undefined;
  }

  /**
   * Adds a new element with a specified key and value to the HashMap. If an element with the same key already exists, the element will be updated.
   * @group Entries
   */
  set(key: K, val: V): HashMap<K, V> {
    const addedLeaf = { val: false };
    const root = this.root ?? EMPTY;
    const newRoot = assoc(root, 0, getHash(key), key, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    this.root = newRoot;
    this._size = addedLeaf.val ? this._size + 1 : this._size;
    return this;
  }

  //#endregion

  //#region Iterables

  /**
   * Returns an iterable of entries in the HashMap.
   * @group Iterables
   */
  [Symbol.iterator]() {
    return this.entries();
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the HashMap.
   * @group Iterables
   */
  entries() {
    return Iterator.from(toArray(this.root));
  }

  /**
   * Returns an iterable of keys in the HashMap.
   * @group Iterables
   */
  keys() {
    return this.entries().map(([k]) => k);
  }

  /**
   * Returns an iterable of values in the HashMap.
   * @group Iterables
   */
  values() {
    return this.entries().map(([, v]) => v);
  }

  //#endregion

  //#region Reductions

  /**
   * Calls a defined callback function on each entry of a HashMap, and returns a HashMap with the same keys as the original with those values mapped to the result
   *
   * @group Reductions
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each entry in the HashMap.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map<U, C>(callbackfn: (val: V, key: K, hashMap: HashMap<K, V>) => U, thisArg: C): HashMap<K, U>;
  /**
   * Calls a defined callback function on each entry of a HashMap, and returns a HashMap with the same keys as the original with those values mapped to the result
   *
   * @group Reductions
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each entry in the HashMap.
   */
  map<U>(callbackfn: (val: V, key: K, hashMap: HashMap<K, V>) => U): HashMap<K, U>;
  map<U>(callbackfn: (val: V, key: K, hashMap: HashMap<K, V>) => U, thisArg?: unknown): HashMap<K, U> {
    const hashMap = new HashMap<K, U>();
    this.forEach((v, k) => {
      hashMap.set(k, callbackfn.call(thisArg, v, k, this));
    });
    return hashMap;
  }

  /**
   * Returns a new HashMap with only the entries that meet the condition specified in a callback function.
   *
   * @group Reductions
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each entry in the HashMap.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter<S extends V, C>(
    predicate: (value: V, key: K, hashMap: HashMap<K, V>) => value is S,
    thisArg: C,
  ): HashMap<K, S>;
  /**
   * Returns a new HashMap with only the entries that meet the condition specified in a callback function.
   *
   * @group Reductions
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each entry in the HashMap.
   */
  filter<S extends V>(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => value is S): HashMap<K, S>;
  /**
   * Returns a new HashMap with only the entries that meet the condition specified in a callback function.
   *
   * @group Reductions
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each entry in the HashMap.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter<C>(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean, thisArg: C): HashMap<K, V>;
  /**
   * Returns a new HashMap with only the entries that meet the condition specified in a callback function.
   *
   * @group Reductions
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each entry in the HashMap.
   */
  filter(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean): HashMap<K, V>;
  filter<C>(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean, thisArg?: C): HashMap<K, V> {
    const dict = new HashMap<K, V>();
    this.forEach((v, k) => {
      if (predicate.call(thisArg, v, k, this)) {
        dict.set(k, v);
      }
    });
    return dict;
  }

  /**
   * Returns the key/value tuple of the first entry in the HashMap where predicate is true, and undefined
   * otherwise.
   *
   * @group Reductions
   * @param predicate find calls predicate once for each entry of the HashMap,
   * until it finds one where predicate returns true. If such an entry is found, find
   * immediately returns that entry. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  find<S extends V, C>(
    predicate: (value: V, key: K, hashMap: HashMap<K, V>) => value is S,
    thisArg: C,
  ): [K, S] | undefined;
  /**
   * Returns the key/value tuple of the first entry in the HashMap where predicate is true, and undefined
   * otherwise.
   *
   * @group Reductions
   * @param predicate find calls predicate once for each entry of the HashMap,
   * until it finds one where predicate returns true. If such an entry is found, find
   * immediately returns that entry. Otherwise, find returns undefined.
   */
  find<S extends V>(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => value is S): [K, S] | undefined;
  /**
   * Returns the key/value tuple of the first entry in the HashMap where predicate is true, and undefined
   * otherwise.
   *
   * @group Reductions
   * @param predicate find calls predicate once for each entry of the HashMap,
   * until it finds one where predicate returns true. If such an entry is found, find
   * immediately returns that entry. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  find<C>(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean, thisArg: C): [K, V] | undefined;
  /**
   * Returns the key/value tuple of the first entry in the HashMap where predicate is true, and undefined
   * otherwise.
   *
   * @group Reductions
   * @param predicate find calls predicate once for each entry of the HashMap,
   * until it finds one where predicate returns true. If such an entry is found, find
   * immediately returns that entry. Otherwise, find returns undefined.
   */
  find(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean): [K, V] | undefined;
  find(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean, thisArg?: unknown): [K, V] | undefined {
    for (const [k, v] of this.entries()) {
      if (predicate.call(thisArg, v, k, this)) {
        return [k, v];
      }
    }
    return undefined;
  }

  /**
   * Calls the specified callback function for all the entries in the HashMap. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @group Reductions
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each entry int he HashMap.
   */
  reduce(callbackfn: (accumulator: V, value: V, key: K) => V): V;
  /**
   * Calls the specified callback function for all the entries in the HashMap. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @group Reductions
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each entry in the HashMap.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead.
   */
  reduce<U>(callbackfn: (accumulator: U, value: V, key: K) => U, initialValue: U): U;
  reduce<U>(
    callbackfn: (accumulator: NonNullable<U>, value: V, key: K) => NonNullable<U>,
    initialValue?: U,
  ): NonNullable<U> {
    if (arguments.length === 1 && this.size === 0) {
      throw new TypeError('Reduce of empty HashMap with no initial value');
    }

    let acc = initialValue ?? (this.values().take(1).toArray()[0] as NonNullable<U>);
    const iterator = initialValue === undefined ? this.entries().drop(1) : this.entries();
    for (const [k, v] of iterator) {
      acc = callbackfn(acc, v, k);
    }
    return acc;
  }

  /**
   * Determines whether the specified callback function returns true for any entry in the HashMap
   *
   * @group Reductions
   * @param predicate A function that accepts up to three arguments. The some method calls
   * the predicate function for each entry in the HashMap until the predicate returns a value
   * which is coercible to the Boolean value true, or until the end of the HashMap iteration.
   * @param thisArg An object to which the this keyword can refer in the predicate function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  some<C>(predicate: (this: C, value: V, key: K, hashMap: HashMap<K, V>) => boolean, thisArg: C): boolean;
  /**
   * Determines whether the specified callback function returns true for any entry in the HashMap
   *
   * @group Reductions
   * @param predicate A function that accepts up to three arguments. The some method calls
   * the predicate function for each entry in the HashMap until the predicate returns a value
   * which is coercible to the Boolean value true, or until the end of the HashMap iteration.
   */
  some(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean): boolean;
  some(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean, thisArg?: unknown): boolean {
    for (const [k, v] of this.entries()) {
      if (predicate.call(thisArg, v, k, this)) return true;
    }
    return false;
  }

  /**
   * Determines whether all the entries of a HashMap satisfy the specified test.
   *
   * @group Reductions
   * @param predicate A function that accepts up to three arguments. The every method calls
   * the predicate function for each entries in the HashMap until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the HashMap iteration.
   * @param thisArg An object to which the this keyword can refer in the predicate function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  every<S extends V, C>(
    predicate: (value: V, key: K, hashMap: HashMap<K, V>) => value is S,
    thisArg: C,
  ): this is HashMap<K, S>;
  /**
   * Determines whether all the entries of a HashMap satisfy the specified test.
   *
   * @group Reductions
   * @param predicate A function that accepts up to three arguments. The every method calls
   * the predicate function for each entries in the HashMap until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the HashMap iteration.
   * @param thisArg An object to which the this keyword can refer in the predicate function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  every(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean, thisArg: unknown): boolean;
  /**
   * Determines whether all the entries of a HashMap satisfy the specified test.
   *
   * @group Reductions
   * @param predicate A function that accepts up to three arguments. The every method calls
   * the predicate function for each element in the array until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the HashMap iteration.
   */
  every<S extends V>(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => value is S): this is HashMap<K, S>;
  every(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean): boolean;
  /**
   * Determines whether all the entries of a HashMap satisfy the specified test.
   *
   * @group Reductions
   * @param predicate A function that accepts up to three arguments. The every method calls
   * the predicate function for each element in the array until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the HashMap iteration.
   */
  every(predicate: (value: V, key: K, hashMap: HashMap<K, V>) => boolean, thisArg?: unknown): boolean {
    for (const [k, v] of this.entries()) {
      if (!predicate.call(thisArg, v, k, this)) return false;
    }
    return true;
  }

  //#endregion
}
