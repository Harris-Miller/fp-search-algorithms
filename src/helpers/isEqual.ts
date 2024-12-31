/* eslint-disable complexity */

const unequalDates = (a: Date, b: Date) => {
  return a instanceof Date && (a > b || a < b);
};

const unequalBuffers = (a: Buffer, b: Buffer): boolean => {
  return (
    a.buffer instanceof ArrayBuffer &&
    (a.BYTES_PER_ELEMENT as unknown as boolean) &&
    !(a.byteLength === b.byteLength && a.every((n, i) => n === b[i]))
  );
};

const unequalArrays = <T>(a: readonly T[], b: readonly T[]) => {
  return Array.isArray(a) && a.length !== b.length;
};

const unequalMaps = <K, T>(a: Map<K, T>, b: Map<K, T>) => {
  return a instanceof Map && a.size !== b.size;
};

const unequalSets = <T>(a: Set<T>, b: Set<T>) => {
  return a instanceof Set && (a.size !== b.size || [...a].some(e => !b.has(e)));
};

const unequalRegExps = (a: RegExp, b: RegExp) => {
  return a instanceof RegExp && (a.source !== b.source || a.flags !== b.flags);
};

const isObject = (a: unknown): a is object => {
  return typeof a === 'object' && a !== null;
};

const structurallyCompatibleObjects = (a: object, b: object) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof a !== 'object' && typeof b !== 'object' && (!a || !b)) return false;

  const nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some(c => a instanceof c)) return false;

  return a.constructor === b.constructor;
};

/**
 * Check for equality by structure of two values
 * * Returns true if strict equality (`===`) returns true
 * * Values of different `typeof` return `false`
 * * Objects with different constructors return `false`
 * * Dates return true if both `>` and `<` return false
 * * ArrayBuffers return true when byteLength are equal and if values at all indexes are equal
 * * Arrays return true when lengths are equal and when values at all indexes pass `isEqual()` recursively
 * * Sets returns true when both are empty or when all keys equal on both
 * * Maps returns true when both are empty, when all keys equal on both, and when those key's values pass `isEqual()` recursively
 * * Dispatches to first argument's prototype method `equals: (other) => boolean` if exists
 * * Objects return true when both share same enumerable keys and all key's values  pass `isEqual()` recursively
 *
 * Exceptions:
 * * Functions, Promises, WeakSets, and WeakMaps are checked by reference
 *
 * Notes:
 * * `isEqual({}, Object.create(null))` will always be `false`, regardless of keys/values because they don't share the same constructor
 *
 * @category Helpers
 * @returns boolean indicating whether the values are equal in value, structure, or reference
 */
export const isEqual = <T>(x: T, y: T) => {
  const values: unknown[] = [x, y];

  while (values.length) {
    const a = values.pop();
    const b = values.pop();
    if (a === b) continue;

    if (!isObject(a) || !isObject(b)) return false;
    const unequal =
      !structurallyCompatibleObjects(a, b) ||
      unequalDates(a as unknown as Date, b as unknown as Date) ||
      unequalBuffers(a as unknown as Buffer, b as unknown as Buffer) ||
      unequalArrays(a as unknown[], b as unknown[]) ||
      unequalMaps(a as unknown as Map<unknown, unknown>, b as unknown as Map<unknown, unknown>) ||
      unequalSets(a as unknown as Set<unknown>, b as unknown as Set<unknown>) ||
      unequalRegExps(a as unknown as RegExp, b as unknown as RegExp);
    if (unequal) return false;

    const proto = Object.getPrototypeOf(a) as { equals?: (o: T) => boolean } | null;
    if (proto !== null && typeof proto.equals === 'function') {
      try {
        if ((a as { equals: (o: unknown) => boolean }).equals(b)) continue;
        else return false;
      } catch {
        // fall-through
      }
    }

    if (a instanceof Map) {
      if (!(b instanceof Map)) return false;
      for (const k of a.keys()) {
        values.push(a.get(k), b.get(k));
      }
    } else {
      // assume a and b are objects
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      const bKeysSet = new Set(bKeys);

      if (aKeys.length !== bKeys.length) return false;

      const extra = a instanceof globalThis.Error ? ['message'] : [];
      for (const k of [...extra, ...aKeys]) {
        // @ts-expect-error
        values.push(a[k], b[k]);
        bKeysSet.delete(k);
      }

      if (bKeysSet.size) return false;
    }
  }

  return true;
};
