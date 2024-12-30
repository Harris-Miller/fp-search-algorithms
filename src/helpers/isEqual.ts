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
 * Deep equality check
 *
 * @public
 * @category Helpers
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
        // eslint-disable-next-line no-empty
      } catch {}
    }

    if (a instanceof Map) {
      if (!(b instanceof Map)) return false;
      for (const k of a.keys()) {
        values.push(a.get(k), b.get(k));
      }
    } else {
      // assume a and b are objects
      const extra = a instanceof globalThis.Error ? ['message'] : [];
      for (const k of [...extra, ...Object.keys(a)]) {
        // @ts-expect-error
        values.push(a[k], b[k]);
      }
    }
  }

  return true;
};
