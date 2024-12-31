/* eslint-disable @typescript-eslint/unified-signatures */

import { HashMap } from './hashMap';

/**
 * ### HashSet
 *
 * Value equality is determined by `isEqual`
 *
 * If your values are Javascript [primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), there is no benefit in using a HashSet over the native [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
 *
 * #### Construction
 * `HashSet` is a newable class, and has the static `HashSet.from` functional constructor for convenience and accepts the same arguments
 *
 * #### Native Set API
 * The HashSet API fully implements the Set API and can act as a drop-in replacement with a few caveats:
 * * Non-primitive Set values are equal by reference, a Set may contain two different values that share the same structure. A HashSet will not see those values as being different
 * * Order of insertion is not retained
 *
 * Those methods are:
 * * `clear`, `delete`, `entries`, `forEach`, `add`, `has`, `keys`, `values`, `[Symbol.Iterator]`
 * * readonly prop `size`
 *
 * #### Set Composition API
 *
 * The hashSet API also fully implements the new Composition API methods with one caveat:
 * * Unlike the Set methods which all except "set-like" objects, HashSet _only_ accepts another HashSet in their arguments
 *
 * Those methods are:
 * * `difference`, `intersection`, `isDisjointFrom`, `isSubsetOf`, `isSupersetOf`, `symmetricDifference`, `union`
 *
 * #### Array API
 * HashSet partially implements the Array API, specifically the reduction methods that can apply.
 * The callbackfn signatures match their array equivalent but without the `index: number` argument
 *
 * Those methods are:
 * * `map`, `filter`, `find`, `reduce`, `some`, `every`
 * * Notes:
 *   * `map` and `filter` are immutable, returning a new instance of HashSet
 *
 * #### Additional Utility APIs
 * * `clone` - will return a new instance of a HashSet with the exact same values
 * * `equals` - determine if another HashSet is equal to `this` by determining they share the same values
 * * Therefor `hashSet.equals(hashSet.clone())` will always return `true`
 *
 * #### Custom Equality and Hashing
 * Internally, class instances who's prototypes implement `equals: (other: typeof this) => boolean` and `hashCode(self: typeof this) => number`
 * will be used to determine equality between instances and an instance's hash value respectively.
 * It is recommended to implement these on any class where equality cannot be determined testing on public properties only
 *
 * @category Structures
 */
export class HashSet<T> implements Iterable<T> {
  private dict: HashMap<T, undefined>;

  //#region Constructors

  /**
   * Create a HashSet from a Set.
   *
   * Note: If your Set has non-primitive values that do not equal by reference but deep-equal by structure, only a single value will retain in the HashSet.
   *
   * @group Constructors
   */
  static from<T>(set: Set<T>): HashSet<T>;
  /**
   * Create a HashSet from an Array.
   *
   * Note: If your Array has non-primitive values that do not equal by reference but deep-equal by structure, only a single value will retain in the HashSet.
   *
   * @group Constructors
   */
  static from<T>(values: readonly T[]): HashSet<T>;
  /**
   * Create a HashSet from an Iterable.
   *
   * Note: If your Iterable has non-primitive values that do not equal by reference but deep-equal by structure, only a single value will retain in the HashSet.
   *
   * @group Constructors
   */
  static from<T>(iterable: Iterable<T>): HashSet<T>;
  static from<T>(iterable?: Iterable<T>): HashSet<T> {
    return new HashSet<T>(iterable);
  }

  /**
   * Create an empty HashSet.
   */
  constructor();
  /**
   * Create a HashSet from an Array.
   *
   * Note: If your Array has non-primitive values that do not equal by reference but deep-equal by structure, only a single value will retain in the HashSet.
   */
  constructor(values?: readonly T[] | null);
  /**
   * Create a HashSet from an Iterable.
   *
   * Note: If your Iterable has non-primitive values that do not equal by reference but deep-equal by structure, only a single value will retain in the HashSet.
   */
  constructor(iterable?: Iterable<T> | null);
  constructor(iterable?: Iterable<T> | null) {
    this.dict = new HashMap<T, undefined>();
    if (iterable != null) {
      for (const v of iterable) {
        this.add(v);
      }
    }
  }

  //#endregion

  //#region Utility

  /**
   * Create an immutable copy of the HashSet
   * @group Utility
   */
  clone(): HashSet<T> {
    const set = new HashSet<T>();
    set.dict = this.dict.clone();
    return set;
  }

  /**
   * Check if this HashSet is equal to another
   * Returns `true` when
   * * referentially equal
   * * both HashSets contain exactly the same values
   * * both are empty
   *
   * @group Utility
   */
  equals(other: HashSet<T>): boolean {
    return this.dict.equals(other.dict);
  }

  /**
   * Used internally by `getHash()`
   * @group Utility
   */
  private hashCode(): number {
    // @ts-expect-error
    return this.dict.hashCode();
  }

  //#endregion

  //#region Entries

  /**
   * @group Entries
   * @returns the number of (unique) elements in Set.
   */
  get size() {
    return this.dict.size;
  }

  /**
   * Adds a new element with a specified value to the HashSet.
   * @group Entries
   */
  add(val: T): this {
    this.dict.set(val, undefined);
    return this;
  }

  /**
   * * Empties the HashSet, clearing out all values.
   * @group Entries
   */
  clear(): void {
    this.dict.clear();
  }

  /**
   * Removes a specified value from the HashSet.
   * @group Entries
   * @returns Returns true if an element in the HashSet existed and has been removed, or false if the element does not exist.
   */
  delete(val: T): boolean {
    return this.dict.delete(val);
  }

  /**
   * @group Entries
   * @returns a boolean indicating whether an element with the specified value exists in the HashSet or not.
   */
  has(val: T): boolean {
    return this.dict.has(val);
  }

  /**
   * Executes a provided function once per each value in the HashSet object.
   * @group Entries
   */
  forEach(fn: (val: T) => void): void {
    this.dict.forEach((_v, k) => {
      fn(k);
    });
  }

  //#endregion

  //#region Iterables

  /**
   * Iterates over values in the HashSet
   * @group Iterables
   */
  [Symbol.iterator]() {
    return this.keys();
  }

  /**
   * Returns an iterable of [v,v] pairs for every value `v` in the HashSet.
   * @group Iterables
   */
  entries() {
    return this.dict.keys().map<[T, T]>(k => [k, k]);
  }

  /**
   * Despite its name, returns an iterable of the values in the HashSet.
   * @group Iterables
   */
  keys() {
    return this.dict.keys();
  }

  /**
   * Returns an iterable of values in the HashSet.
   * @group Iterables
   */
  values() {
    return this.dict.keys();
  }

  //#endregion

  //#region Composition

  /**
   * @group Composition
   * @returns a new HashSet containing all the elements in this HashSet which are not also in the argument.
   */
  difference<U>(other: HashSet<U>): HashSet<T & U> {
    const [iter, check] = (this.size > other.size ? [other, this] : [this, other]) as [HashSet<T & U>, HashSet<T & U>];
    const set = this.clone() as HashSet<T & U>;
    for (const v of iter) {
      if (check.has(v)) {
        set.delete(v);
      }
    }
    return set;
  }

  /**
   * @group Composition
   * @returns a new HashSet containing all the elements which are both in this HashSet and in the argument.
   */
  intersection<U>(other: HashSet<U>): HashSet<T & U> {
    const [iter, check] = (this.size > other.size ? [other, this] : [this, other]) as [HashSet<T & U>, HashSet<T & U>];
    const set = new HashSet<T & U>();
    for (const v of iter) {
      if (check.has(v)) {
        set.add(v);
      }
    }
    return set;
  }

  /**
   * @group Composition
   * @returns a boolean indicating whether this HashSet has no elements in common with the argument.
   */
  isDisjointFrom(other: HashSet<T>): boolean {
    const [iter, check] = this.size > other.size ? [other, this] : [this, other];
    for (const v of iter) {
      if (check.has(v)) return false;
    }
    return true;
  }

  /**
   * @group Composition
   * @returns a boolean indicating whether all the elements in this HashSet are also in the argument.
   */
  isSubsetOf(other: HashSet<T>): boolean {
    for (const v of this) {
      if (!other.has(v)) return false;
    }
    return true;
  }

  /**
   * @group Composition
   * @returns a boolean indicating whether all the elements in the argument are also in this HashSet.
   */
  isSupersetOf(other: HashSet<T>): boolean {
    for (const v of other) {
      if (!this.has(v)) return false;
    }
    return true;
  }

  /**
   * @group Composition
   * @returns a new HashSet containing all the elements which are in either this HashSet or in the argument, but not in both.
   */
  symmetricDifference(other: HashSet<T>): HashSet<T> {
    const set = this.clone();
    for (const v of other) {
      if (set.has(v)) {
        set.delete(v);
      } else {
        set.add(v);
      }
    }
    return set;
  }

  /**
   * @group Composition
   * @returns a new HashSet containing all the elements in this HashSet and also all the elements in the argument.
   */
  union<U>(other: HashSet<U>): HashSet<T | U> {
    const set = this.clone() as HashSet<T | U>;
    const iter = other.keys();
    let visit = iter.next();
    while (!(visit.done ?? false)) {
      if (!set.has(visit.value)) {
        set.add(visit.value);
      }
      visit = iter.next();
    }
    return set;
  }

  //#endregion

  //#region Reductions

  /**
   * Calls a defined callback function on each entry of a HashSet, and returns a HashSet with the collection of unique values returned by each.
   *
   * @group Reductions
   * @param callbackfn A function that accepts up to two arguments. The map method calls the callbackfn function one time for each value in the HashSet.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map<U, C>(callbackfn: (value: T, hashSet: HashSet<T>) => U, thisArg: C): HashSet<U>;
  /**
   * Calls a defined callback function on each entry of a HashSet, and returns a HashSet with the collection of unique values returned by each.
   *
   * @group Reductions
   * @param callbackfn A function that accepts up to two arguments. The map method calls the callbackfn function one time for each value in the HashSet.
   */
  map<U>(callbackfn: (value: T, hashSet: HashSet<T>) => U): HashSet<U>;
  map<U>(callbackfn: (value: T, hashSet: HashSet<T>) => U, thisArg?: unknown): HashSet<U> {
    const hashSet = new HashSet<U>();
    this.forEach(v => {
      hashSet.add(callbackfn.call(thisArg, v, this));
    });
    return hashSet;
  }

  /**
   * Returns a new HashSet with only the values that meet the condition specified in a callback function.
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The filter method calls the predicate function one time for each value in the HashSet.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter<S extends T, C>(predicate: (value: T, hashSet: HashSet<T>) => value is S, thisArg: C): HashSet<S>;
  /**
   * Returns a new HashSet with only the values that meet the condition specified in a callback function.
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The filter method calls the predicate function one time for each value in the HashSet.
   */
  filter<S extends T>(predicate: (value: T, hashSet: HashSet<T>) => value is S): HashSet<S>;
  /**
   * Returns a new HashSet with only the values that meet the condition specified in a callback function.
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The filter method calls the predicate function one time for each value in the HashSet.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter<C>(predicate: (value: T, hashSet: HashSet<T>) => boolean, thisArg: C): HashSet<T>;
  /**
   * Returns a new HashSet with only the values that meet the condition specified in a callback function.
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The filter method calls the predicate function one time for each value in the HashSet.
   */
  filter(predicate: (value: T, hashSet: HashSet<T>) => boolean): HashSet<T>;
  filter<C>(predicate: (value: T, hashSet: HashSet<T>) => boolean, thisArg?: C): HashSet<T> {
    const hashSet = new HashSet<T>();
    this.forEach(v => {
      if (predicate.call(thisArg, v, this)) {
        hashSet.add(v);
      }
    });
    return hashSet;
  }

  /**
   * Returns the first value in the HashSet where predicate is true, or undefined
   * otherwise.
   *
   * @group Reductions
   * @param predicate find calls predicate once for each entry of the HashSet,
   * until it finds one where predicate returns true. If such an entry is found, find
   * immediately returns that entry. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  find<S extends T, C>(predicate: (value: T, hashSet: HashSet<T>) => value is S, thisArg: C): S | undefined;
  /**
   * Returns the first value in the HashSet where predicate is true, or undefined
   * otherwise.
   *
   * @group Reductions
   * @param predicate find calls predicate once for each entry of the HashSet,
   * until it finds one where predicate returns true. If such an entry is found, find
   * immediately returns that entry. Otherwise, find returns undefined.
   */
  find<S extends T>(predicate: (value: T, hashSet: HashSet<T>) => value is S): S | undefined;
  /**
   * Returns the first value in the HashSet where predicate is true, or undefined
   * otherwise.
   *
   * @group Reductions
   * @param predicate find calls predicate once for each entry of the HashSet,
   * until it finds one where predicate returns true. If such an entry is found, find
   * immediately returns that entry. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  find<C>(predicate: (value: T, hashSet: HashSet<T>) => boolean, thisArg: C): T | undefined;
  /**
   * Returns the first value in the HashSet where predicate is true, or undefined
   * otherwise.
   *
   * @group Reductions
   * @param predicate find calls predicate once for each entry of the HashSet,
   * until it finds one where predicate returns true. If such an entry is found, find
   * immediately returns that entry. Otherwise, find returns undefined.
   */
  find(predicate: (value: T, hashSet: HashSet<T>) => boolean): T | undefined;
  find(predicate: (value: T, hashSet: HashSet<T>) => boolean, thisArg?: unknown): T | undefined {
    for (const v of this.values()) {
      if (predicate.call(thisArg, v, this)) {
        return v;
      }
    }
    return undefined;
  }

  /**
   * Calls the specified callback function for all the entries in the HashSet. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @group Reductions
   * @param callbackfn A function that accepts up to three arguments. The reduce method calls the callbackfn function one time for each entry int he HashSet.
   */
  reduce(callbackfn: (accumulator: T, value: T, hashSet: HashSet<T>) => T): T;
  /**
   * Calls the specified callback function for all the entries in the HashSet. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @group Reductions
   * @param callbackfn A function that accepts up to three arguments. The reduce method calls the callbackfn function one time for each entry in the HashSet.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead.
   */
  reduce<U>(callbackfn: (accumulator: U, value: T, hashSet: HashSet<T>) => U, initialValue: U): U;
  reduce<U>(
    callbackfn: (accumulator: NonNullable<U>, value: T, hashSet: HashSet<T>) => NonNullable<U>,
    initialValue?: U,
  ): NonNullable<U> {
    if (arguments.length === 1 && this.size === 0) {
      throw new TypeError('Reduce of empty HashSet with no initial value');
    }

    let acc = initialValue ?? (this.values().take(1).toArray()[0] as NonNullable<U>);
    const iterator = initialValue === undefined ? this.values().drop(1) : this.values();
    for (const v of iterator) {
      acc = callbackfn(acc, v, this);
    }
    return acc;
  }

  /**
   * Determines whether the specified callback function returns true for any value in the HashSet
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The some method calls
   * the predicate function for each value in the HashSet until the predicate returns a value
   * which is coercible to the Boolean value true, or until the end of the HashSet iteration.
   * @param thisArg An object to which the this keyword can refer in the predicate function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  some<C>(predicate: (this: C, value: T, hashMap: HashSet<T>) => boolean, thisArg: C): boolean;
  /**
   * Determines whether the specified callback function returns true for any value in the HashSet
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The some method calls
   * the predicate function for each value in the HashSet until the predicate returns a value
   * which is coercible to the Boolean value true, or until the end of the HashSet iteration.
   */
  some(predicate: (value: T, hashMap: HashSet<T>) => boolean): boolean;
  some(predicate: (value: T, hashMap: HashSet<T>) => boolean, thisArg?: unknown): boolean {
    for (const v of this.values()) {
      if (predicate.call(thisArg, v, this)) return true;
    }
    return false;
  }

  /**
   * Determines whether all the values of a HashSet satisfy the specified test.
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The every method calls
   * the predicate function for each value in the HashSet until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the HashSet iteration.
   * @param thisArg An object to which the this keyword can refer in the predicate function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  every<S extends T, C>(predicate: (value: T, hashSet: HashSet<T>) => value is S, thisArg: C): this is HashSet<S>;
  /**
   * Determines whether all the values of a HashSet satisfy the specified test.
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The every method calls
   * the predicate function for each value in the HashSet until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the HashSet iteration.
   * @param thisArg An object to which the this keyword can refer in the predicate function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  every<C>(predicate: (value: T, hashSet: HashSet<T>) => boolean, thisArg: C): boolean;
  /**
   * Determines whether all the values of a HashSet satisfy the specified test.
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The every method calls
   * the predicate function for each value in the array until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the HashSet iteration.
   */
  every<S extends T>(predicate: (value: T, hashSet: HashSet<T>) => value is S): this is HashSet<S>;
  /**
   * Determines whether all the values of a HashSet satisfy the specified test.
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The every method calls
   * the predicate function for each value in the array until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the HashSet iteration.
   */
  every(predicate: (value: T, hashSet: HashSet<T>) => boolean): boolean;
  /**
   * Determines whether all the values of a HashSet satisfy the specified test.
   *
   * @group Reductions
   * @param predicate A function that accepts up to two arguments. The every method calls
   * the predicate function for each value in the array until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the HashSet iteration.
   */
  every(predicate: (value: T, hashSet: HashSet<T>) => boolean, thisArg?: unknown): boolean {
    for (const v of this.values()) {
      if (!predicate.call(thisArg, v, this)) return false;
    }
    return true;
  }

  //#endregion
}
