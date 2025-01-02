/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable func-style */

//
// This file is a fork of: https://github.com/gleam-lang/stdlib/blob/main/src/dict.mjs
// * ported to typescript
// * originally written with full immutability for Gleam, but I updated it to do in-place mutations for performance gains
// * My HashMap and HashSet are intentionally mutable to match that characteristic of the native Map and Set
//

import { isEqual } from '../../helpers/isEqual';

import { getHash } from './hashing';

const SHIFT = 5; // number of bits you need to shift by to get the next bucket
const BUCKET_SIZE = 2 ** SHIFT;
const MASK = BUCKET_SIZE - 1; // used to zero out all bits not in the bucket
const MAX_INDEX_NODE = BUCKET_SIZE / 2; // when does index node grow into array node
const MIN_ARRAY_NODE = BUCKET_SIZE / 4; // when does array node shrink to index node
const ENTRY = 0;
const ARRAY_NODE = 1;
const INDEX_NODE = 2;
const COLLISION_NODE = 3;

/** @internal */
export type Node<K, V> = ArrayNode<K, V> | CollisionNode<K, V> | IndexNode<K, V>;
type Entry<K, V> = { k: K; type: typeof ENTRY; v: V };
type ArrayNode<K, V> = {
  array: (Entry<K, V> | Node<K, V> | undefined)[];
  size: number;
  type: typeof ARRAY_NODE;
};
/** @internal */
export type IndexNode<K, V> = { array: (Entry<K, V> | Node<K, V>)[]; bitmap: number; type: typeof INDEX_NODE };
type CollisionNode<K, V> = { array: Entry<K, V>[]; hash: number; type: typeof COLLISION_NODE };
type Flag = { val: boolean };

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createEmptyNode = (): IndexNode<any, any> => ({
  array: [],
  bitmap: 0,
  type: INDEX_NODE,
});

/**
 * Mask the hash to get only the bucket corresponding to shift
 * @internal
 */
export function mask(hash: number, shift: number): number {
  return (hash >>> shift) & MASK;
}

/**
 * Set only the Nth bit where N is the masked hash
 * @internal
 */
export function bitpos(hash: number, shift: number): number {
  return 1 << mask(hash, shift);
}

/**
 * Count the number of 1 bits in a number
 */
function bitcount(x: number): number {
  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x += x >> 8;
  x += x >> 16;
  return x & 0x7f;
}

/**
 * Calculate the array index of an item in a bitmap index node
 */
function index(bitmap: number, bit: number): number {
  return bitcount(bitmap & (bit - 1));
}

/**
 * Create a new node containing two entries
 */
function createNode<K, V>(shift: number, key1: K, val1: V, key2hash: number, key2: K, val2: V): Node<K, V> {
  const key1hash = getHash(key1);
  if (key1hash === key2hash) {
    return {
      array: [
        { k: key1, type: ENTRY, v: val1 },
        { k: key2, type: ENTRY, v: val2 },
      ],
      hash: key1hash,
      type: COLLISION_NODE,
    };
  }
  const addedLeaf = { val: false };
  return assoc(
    assocIndex(createEmptyNode(), shift, key1hash, key1, val1, addedLeaf),
    shift,
    key2hash,
    key2,
    val2,
    addedLeaf,
  );
}

/**
 * Associate a node with a new entry, creating a new node
 * @internal
 */
export function assoc<K, V>(
  root: Node<K, V>,
  shift: number,
  hash: number,
  key: K,
  val: V,
  addedLeaf: Flag,
): Node<K, V> {
  switch (root.type) {
    case ARRAY_NODE:
      return assocArray(root, shift, hash, key, val, addedLeaf);
    case INDEX_NODE:
      return assocIndex(root, shift, hash, key, val, addedLeaf);
    case COLLISION_NODE:
      return assocCollision(root, shift, hash, key, val, addedLeaf);
    default:
      throw new Error('function assoc :: non-exhaustive');
  }
}

function assocArray<K, V>(
  root: ArrayNode<K, V>,
  shift: number,
  hash: number,
  key: K,
  val: V,
  addedLeaf: Flag,
): Node<K, V> {
  const idx = mask(hash, shift);
  const node = root.array[idx];

  // if the corresponding index is empty set the index to a newly created node
  if (node === undefined) {
    addedLeaf.val = true;
    root.array[idx] = { k: key, type: ENTRY, v: val };
    root.size += 1;
    return root;
  }

  if (node.type === ENTRY) {
    // if keys are equal replace the entry
    if (isEqual(key, node.k)) {
      if (val === node.v) return root;
      root.array[idx] = { k: key, type: ENTRY, v: val };
      return root;
    }

    // otherwise upgrade the entry to a node and insert
    addedLeaf.val = true;
    root.array[idx] = createNode(shift + SHIFT, node.k, node.v, hash, key, val);
    return root;
  }

  // otherwise call assoc on the child node
  root.array[idx] = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
  return root;
}

function assocIndex<K, V>(
  root: IndexNode<K, V>,
  shift: number,
  hash: number,
  key: K,
  val: V,
  addedLeaf: Flag,
): Node<K, V> {
  const bit = bitpos(hash, shift);
  const idx = index(root.bitmap, bit);
  // if there is already a item at this hash index..
  if ((root.bitmap & bit) !== 0) {
    // if there is a node at the index (not an entry), call assoc on the child node
    const node = root.array[idx];
    if (node.type !== ENTRY) {
      const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
      root.array[idx] = n;
      return root;
    }

    // otherwise there is an entry at the index
    // if the keys are equal replace the entry with the updated value
    const nodeKey = node.k;
    if (isEqual(key, nodeKey)) {
      if (val === node.v) return root;
      node.v = val;
      return root;
    }

    // if the keys are not equal, replace the entry with a new child node
    addedLeaf.val = true;
    root.array[idx] = createNode(shift + SHIFT, nodeKey, node.v, hash, key, val);
    root.type = INDEX_NODE;
    return root;
  }
  // else there is currently no item at the hash index
  const n = root.array.length;
  // if the number of nodes is at the maximum, expand this node into an array node
  if (n >= MAX_INDEX_NODE) {
    // create a 32 length array for the new array node (one for each bit in the hash)
    const nodes = new Array<Entry<K, V> | Node<K, V>>(32);
    // create and insert a node for the new entry
    const jdx = mask(hash, shift);
    nodes[jdx] = assocIndex(createEmptyNode(), shift + SHIFT, hash, key, val, addedLeaf);
    let j = 0;
    let { bitmap } = root;
    // place each item in the index node into the correct spot in the array node
    // loop through all 32 bits / array positions
    for (let i = 0; i < 32; i++) {
      if ((bitmap & 1) !== 0) {
        const node = root.array[j++];
        nodes[i] = node;
      }
      // shift the bitmap to process the next bit
      bitmap >>>= 1;
    }
    return {
      array: nodes,
      size: n + 1,
      type: ARRAY_NODE,
    };
  }

  // else there is still space in this index node
  // simply insert a new entry at the hash index

  addedLeaf.val = true;

  const newEntryNode: Entry<K, V> = {
    k: key,
    type: ENTRY,
    v: val,
  };
  root.array.splice(idx, 0, newEntryNode);
  root.bitmap |= bit;
  return root;
}

function assocCollision<K, V>(
  root: CollisionNode<K, V>,
  shift: number,
  hash: number,
  key: K,
  val: V,
  addedLeaf: Flag,
): Node<K, V> {
  // if there is a hash collision
  if (hash === root.hash) {
    const idx = collisionIndexOf(root, key);
    // if this key already exists replace the entry with the new value
    if (idx !== -1) {
      const entry = root.array[idx];

      if (entry.v === val) return root;

      root.array[idx] = { k: key, type: ENTRY, v: val };
      return root;
    }

    // otherwise insert the entry at the end of the array
    addedLeaf.val = true;
    root.array.push({ k: key, type: ENTRY, v: val });
    return root;
  }

  // if there is no hash collision, upgrade to an index node
  return assoc(
    {
      array: [root],
      bitmap: bitpos(root.hash, shift),
      type: INDEX_NODE,
    },
    shift,
    hash,
    key,
    val,
    addedLeaf,
  );
}

/**
 * Find the index of a key in the collision node's array
 */
function collisionIndexOf<K, V>(root: CollisionNode<K, V>, key: K): number {
  const size = root.array.length;
  for (let i = 0; i < size; i++) {
    if (isEqual(key, root.array[i].k)) {
      return i;
    }
  }
  return -1;
}

/**
 * Return the found entry or undefined if not present in the root
 * @internal
 */
export function find<K, V>(root: Node<K, V>, shift: number, hash: number, key: K): Entry<K, V> | undefined {
  switch (root.type) {
    case ARRAY_NODE:
      return findArray(root, shift, hash, key);
    case INDEX_NODE:
      return findIndex(root, shift, hash, key);
    case COLLISION_NODE:
      return findCollision(root, key);
    default:
      throw new Error('function find :: non-exhaustive');
  }
}

function findArray<K, V>(root: ArrayNode<K, V>, shift: number, hash: number, key: K): Entry<K, V> | undefined {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === undefined) {
    return undefined;
  }
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return undefined;
}

function findIndex<K, V>(root: IndexNode<K, V>, shift: number, hash: number, key: K): Entry<K, V> | undefined {
  const bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return undefined;
  }
  const idx = index(root.bitmap, bit);
  const node = root.array[idx];
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return undefined;
}

function findCollision<K, V>(root: CollisionNode<K, V>, key: K): Entry<K, V> | undefined {
  const idx = collisionIndexOf(root, key);
  if (idx < 0) {
    return undefined;
  }
  return root.array[idx];
}

/**
 * Remove an entry from the root, returning the updated root.
 * Returns undefined if the node should be removed from the parent.
 * @internal
 */
export function without<K, V>(root: Node<K, V>, shift: number, hash: number, key: K): Node<K, V> | undefined {
  switch (root.type) {
    case ARRAY_NODE:
      return withoutArray(root, shift, hash, key);
    case INDEX_NODE:
      return withoutIndex(root, shift, hash, key);
    case COLLISION_NODE:
      return withoutCollision(root, key);
    default:
      throw new Error('function without :: non-exhaustive');
  }
}

function withoutArray<K, V>(root: ArrayNode<K, V>, shift: number, hash: number, key: K): Node<K, V> | undefined {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === undefined) return root; // already empty

  let n: Node<K, V> | undefined;
  // if node is an entry and the keys are not equal there is nothing to remove
  // if node is not an entry do a recursive call
  if (node.type === ENTRY) {
    if (!isEqual(node.k, key)) {
      return root; // no changes
    }
  } else {
    n = without(node, shift + SHIFT, hash, key);
  }
  // if ENTRY and isEqual, or the recursive call returned undefined, the node should be removed
  if (n === undefined) {
    // if the number of child nodes is at the minimum, pack into an index node
    if (root.size <= MIN_ARRAY_NODE) {
      const arr = root.array;
      const out = new Array<Entry<K, V> | Node<K, V>>(root.size - 1);
      let i = 0;
      let j = 0;
      let bitmap = 0;
      while (i < idx) {
        const nv = arr[i];
        if (nv !== undefined) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      ++i; // skip copying the removed node
      while (i < arr.length) {
        const nv = arr[i];
        if (nv !== undefined) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      return {
        array: out,
        bitmap,
        type: INDEX_NODE,
      };
    }

    root.array[idx] = n;
    root.size -= 1;
    return root;
  }

  root.array[idx] = n;
  return root;
}

function withoutIndex<K, V>(root: IndexNode<K, V>, shift: number, hash: number, key: K): Node<K, V> | undefined {
  const bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) return root; // already empty

  const idx = index(root.bitmap, bit);
  const node = root.array[idx];

  // if the item is not an entry
  if (node.type !== ENTRY) {
    const n = without(node, shift + SHIFT, hash, key);

    // if not undefined, the child node still has items, so update it
    if (n !== undefined) {
      root.array[idx] = n;
      return root;
    }

    // otherwise the child node should be removed
    // if it was the only child node, remove this node from the parent
    if (root.bitmap === bit) return undefined;
    // otherwise just remove the child node
    root.array.splice(idx, 1);
    root.bitmap ^= bit;
    return root;
  }

  // otherwise the item is an entry, remove it if the key matches
  if (isEqual(key, node.k)) {
    // if it was the only child node, remove this node from the parent
    if (root.bitmap === bit) return undefined;

    root.array.splice(idx, 1);
    root.bitmap ^= bit;
    return root;
  }

  return root;
}

function withoutCollision<K, V>(root: CollisionNode<K, V>, key: K): Node<K, V> | undefined {
  const idx = collisionIndexOf(root, key);
  // if the key not found, no changes
  if (idx < 0) return root;

  // otherwise the entry was found, remove it
  // if it was the only entry in this node, remove the whole node
  if (root.array.length === 1) return undefined;

  // otherwise just remove the entry
  root.array.splice(idx, 1);
  return root;
}

/** @internal */
export function forEach<K, V>(root: Node<K, V> | undefined, fn: (value: V, key: K) => void): void {
  if (root === undefined) {
    return;
  }
  const items = root.array;
  const size = items.length;
  for (let i = 0; i < size; i++) {
    const item = items[i];
    if (item === undefined) {
      continue;
    }
    if (item.type === ENTRY) {
      fn(item.v, item.k);
      continue;
    }
    forEach(item, fn);
  }
}

/** @internal */
export function toArray<K, V>(root: Node<K, V> | undefined): [K, V][] {
  const array: [K, V][] = [];
  forEach(root, (v, k) => array.push([k, v]));
  return array;
}
