/* eslint-disable no-plusplus */
/* eslint-disable complexity */
const typeOrder = ['boolean', 'number', 'bigint', 'string', 'object'] as const;
type ValidOrderTypes = (typeof typeOrder)[number];

export const LT = -1;
export const EQ = 0;
export const GT = 1;
export type Ord = -1 | 0 | 1;

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getType = (thing: any): ValidOrderTypes => {
  if (thing instanceof Promise) {
    throw new TypeError('cannot order instances of Promise');
  }

  if (thing instanceof WeakSet) {
    throw new TypeError('cannot order instances of WeakSet');
  }

  if (thing instanceof WeakMap) {
    throw new TypeError('cannot order instances of WeakMap');
  }

  if (thing instanceof ArrayBuffer) {
    throw new TypeError('cannot order instances of ArrayBuffer');
  }

  const type = typeof thing;

  switch (type) {
    case 'symbol':
      throw new TypeError('cannot order Symbols');
    case 'function':
      throw new TypeError('cannot order Functions');
    default:
      return type as ValidOrderTypes;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const omniCompare = (a: any, b: any): Ord => {
  if (a === undefined) {
    if (b === undefined) return EQ;
    return LT;
  }
  if (b === undefined) return GT;

  if (a === null) {
    if (b === null) return EQ;
    return LT;
  }
  if (b === null) return GT;

  const typeofA = getType(a);
  const typeofB = getType(b);

  if (a === b) return EQ;

  const typeIndexA = typeOrder.indexOf(typeofA);
  const typeIndexB = typeOrder.indexOf(typeofB);

  if (typeIndexA < typeIndexB) return LT;
  if (typeIndexA > typeIndexB) return GT;

  if (typeofA !== 'object') {
    return a < b ? LT : GT;
  }

  if (a instanceof Date) {
    if (b instanceof Date) {
      if (a < b) return LT;
      if (a > b) return GT;
      return EQ;
    }
    return LT;
  }
  if (b instanceof Date) return GT;

  if (Array.isArray(a)) {
    if (Array.isArray(b)) {
      const lenA = a.length;
      const lenB = b.length;
      let i = 0;
      while (i < lenA) {
        // this means b has more items than a
        if (i === lenB) return LT;
        const r = omniCompare(a[i], b[i]);
        if (r !== EQ) return r;
        i++;
      }
      return lenB > lenA ? LT : EQ;
    }
    return LT;
  }
  if (Array.isArray(b)) return GT;

  const protoA = Object.getPrototypeOf(a) as { lte: (v: unknown) => unknown } | null;
  const protoB = Object.getPrototypeOf(b) as { lte: (v: unknown) => unknown } | null;
  if (protoA !== null && protoB !== null && typeof protoA.lte === 'function' && typeof protoB.lte === 'function') {
    try {
      const isALteB = (a as { lte: (other: unknown) => boolean }).lte(b);
      const isBLteA = (b as { lte: (other: unknown) => boolean }).lte(a);
      if (typeof isALteB === 'boolean' && typeof isBLteA === 'boolean') {
        if (isALteB && isBLteA) return EQ;
        if (isALteB) return LT;
        return GT;
      }
    } catch {
      // fall through
    }
  }

  throw new Error('omniCompare has received a yet to be implemented type');

  // TODO, the rest
  // return EQ;
};
