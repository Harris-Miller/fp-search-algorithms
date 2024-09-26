/* eslint-disable @typescript-eslint/no-use-before-define, complexity, no-bitwise, no-plusplus */

//
// Blatantly stolen from https://github.com/gleam-lang/stdlib/blob/main/src/dict.mjs
//

const referenceMap = new WeakMap<WeakKey, number>();
const tempDataView = new DataView(new ArrayBuffer(8));
let referenceUID = 0;

/**
 * hash the object by reference using a weak map and incrementing uid
 * @param {any} obj
 * @returns {number}
 */
const hashByReference = (obj: object | symbol): number => {
  const known = referenceMap.get(obj);
  if (known !== undefined) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 0x7fffffff) {
    referenceUID = 0;
  }
  referenceMap.set(obj, hash);
  return hash;
};

/**
 * merge two hashes in an order sensitive way
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
const hashMerge = (a: number, b: number): number => (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0;

/**
 * standard string hash popularised by java
 * @param {string} str
 * @returns {number}
 */
const hashString = (str: string): number => {
  let hash = 0;
  const len = str.length;
  for (let i = 0; i < len; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
};

/**
 * hash a number by converting to two integers and do some jumbling
 * @param {number} num
 * @returns {number}
 */
const hashNumber = (num: number): number => {
  tempDataView.setFloat64(0, num);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(0x45d9f3b, (i >> 16) ^ i) ^ j;
};

/**
 * hash a BigInt by converting it to a string and hashing that
 * @param {BigInt} num
 * @returns {number}
 */
const hashBigInt = (num: bigint): number => hashString(num.toString());

/**
 * hash any js object
 * @param {any} obj
 * @returns {number}
 */
const hashObject = (obj: object): number => {
  const proto = Object.getPrototypeOf(obj) as { hashCode?: (o: object) => number } | null;
  if (proto !== null && typeof proto.hashCode === 'function') {
    try {
      const code = (obj as { hashCode: (o: object) => number }).hashCode(obj);
      if (typeof code === 'number') {
        return code;
      }
    } catch {
      // noop, try next if statement
    }
  }

  if (obj instanceof Promise || obj instanceof WeakSet || obj instanceof WeakMap) {
    return hashByReference(obj);
  }

  if (obj instanceof Date) {
    return hashNumber(obj.getTime());
  }

  let h = 0;
  if (obj instanceof ArrayBuffer) {
    // eslint-disable-next-line no-param-reassign
    obj = new Uint8Array(obj);
  }

  if (Array.isArray(obj) || obj instanceof Uint8Array) {
    for (let i = 0; i < obj.length; i++) {
      h = (Math.imul(31, h) + getHash(obj[i])) | 0;
    }
  } else if (obj instanceof Set) {
    obj.forEach(v => {
      h = (h + getHash(v)) | 0;
    });
  } else if (obj instanceof Map) {
    obj.forEach((v, k) => {
      h = (h + hashMerge(getHash(v), getHash(k))) | 0;
    });
  } else {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      // @ts-expect-error - k is not keyof obj
      const v = obj[k] as unknown;
      h = (h + hashMerge(getHash(v), hashString(k))) | 0;
    }
  }
  return h;
};

/**
 * hash any js value
 * @param {any} u
 * @returns {number}
 */
// needs to be a function declaration, cyclical use in `hashObject`
// eslint-disable-next-line func-style, prefer-arrow/prefer-arrow-functions
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
      // should be unreachable
      return 0;
  }
}
