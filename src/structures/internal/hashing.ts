/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable complexity */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable func-style */

//
// Credit to: https://github.com/gleam-lang/stdlib/blob/main/src/dict.mjs
// Ported to typescript
//

const referenceMap = new WeakMap<WeakKey, number>();
const tempDataView = new DataView(new ArrayBuffer(8));
let referenceUID = 0;

/**
 * hash the object by reference using a weak map and incrementing uid
 */
const hashByReference = (o: WeakKey): number => {
  const known = referenceMap.get(o);
  if (known !== undefined) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 0x7fffffff) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
};

/**
 * merge two hashes in an order sensitive way
 */
export const hashMerge = (a: number, b: number): number => (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0;

/**
 * standard string hash popularized by java
 */
const hashString = (s: string): number => {
  let hash = 0;
  const len = s.length;
  for (let i = 0; i < len; i++) {
    hash = (Math.imul(31, hash) + s.charCodeAt(i)) | 0;
  }
  return hash;
};

/**
 * hash a number by converting to two integers and do some jumbling
 */
const hashNumber = (n: number): number => {
  tempDataView.setFloat64(0, n);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(0x45d9f3b, (i >> 16) ^ i) ^ j;
};

/**
 * hash a BigInt by converting it to a string and hashing that
 */
const hashBigInt = (n: bigint): number => hashString(n.toString());

/**
 * hash any js object
 */
const hashObject = (o: object): number => {
  const proto = Object.getPrototypeOf(o) as { hashCode: (v: unknown) => unknown } | null;
  if (proto !== null && typeof proto.hashCode === 'function') {
    try {
      const code = (o as { hashCode: (v: unknown) => unknown }).hashCode(o);
      if (typeof code === 'number') {
        return code;
      }
      // eslint-disable-next-line no-empty
    } catch {}
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0; i < o.length; i++) {
      h = (Math.imul(31, h) + getHash(o[i])) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach(v => {
      h = (h + getHash(v)) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = (h + hashMerge(getHash(v), getHash(k))) | 0;
    });
  } else {
    const keys = Object.keys(o) as (keyof typeof o)[];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const v = o[k];
      h = (h + hashMerge(getHash(v), hashString(k))) | 0;
    }
  }
  return h;
};

/**
 * hash any js value
 */
export function getHash(u: unknown): number {
  if (u === null) return 0x42108422;
  if (u === undefined) return 0x42108423;
  if (u === true) return 0x42108421;
  if (u === false) return 0x42108420;
  switch (typeof u) {
    case 'number':
      return hashNumber(u);
    case 'string':
      return hashString(u);
    case 'bigint':
      return hashBigInt(u);
    case 'object':
      return hashObject(u);
    case 'symbol':
      return hashByReference(u);
    case 'function':
      return hashByReference(u);
    default:
      throw new Error('getHash - non-exhaustive switch statement');
  }
}
