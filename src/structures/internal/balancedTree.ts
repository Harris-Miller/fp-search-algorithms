/* eslint-disable complexity */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import { isEqual } from '../../helpers/isEqual';
import { GT, omniCompare } from '../../helpers/ordering';

const MIN_DEGREE = 2;
const MIN_LEN = MIN_DEGREE - 1;
const MAX_LEN = 2 * MIN_DEGREE - 1;

type Flag = { val: boolean };
export type KeyValuePair<K, V> = [key: K, value: V];
export type Node<K, V> = { children: Node<K, V>[]; kvs: KeyValuePair<K, V>[] };

export const createEmptyNode = <K, V>(): Node<K, V> => ({ children: [], kvs: [] });

const splitChild = <K, V>(node: Node<K, V>, i: number) => {
  // designate child at index now as left child
  const left = node.children[i];
  // and create new right node
  const right: Node<K, V> = { children: [], kvs: [] };

  // split off keys from middle onward
  const [val, ...rightKvs] = left.kvs.splice(MIN_DEGREE - 1, MIN_DEGREE);
  // set on right
  right.kvs = rightKvs;

  // if has children, split evenly
  if (left.children.length !== 0) {
    right.children = left.children.splice(MIN_DEGREE, MIN_DEGREE + 1);
  }

  node.kvs.splice(i, 0, val);
  node.children.splice(i + 1, 0, right);
};

/**
 * If we're in this function we know that key does not exist in node
 */
const _insert = <K, V>(node: Node<K, V>, key: K, val: V, addedLeaf: Flag): void => {
  // find last index where k <= this.keys[i]
  let i = node.kvs.findLastIndex(([k]) => omniCompare(k, key) !== GT);

  if (i !== -1 && isEqual(node.kvs[i][0], key)) {
    node.kvs[i][1] = val;
    addedLeaf.val = true;
    return;
  }

  // update i to index to insert at
  i += 1;

  if (node.children.length === 0) {
    node.kvs.splice(i, 0, [key, val]);
    addedLeaf.val = true;
    return;
  }

  const child = node.children[i];
  _insert(child, key, val, addedLeaf);

  if (child.kvs.length === MAX_LEN) {
    splitChild(node, i);
  }
};

export const insert = <K, V>(root: Node<K, V>, key: K, val: V, addedLeaf: Flag): Node<K, V> => {
  _insert(root, key, val, addedLeaf);

  if (root.kvs.length !== MAX_LEN) return root;

  // split creating new root
  const newRoot = createEmptyNode<K, V>();
  newRoot.children.push(root);
  splitChild(newRoot, 0);
  return newRoot;
};

const pullFromLeftChild = <K, V>(node: Node<K, V>, index: number): void => {
  const left = node.children[index];
  const right = node.children[index + 1];
  const kv = node.kvs[index];

  right.kvs.unshift(kv);
  node.kvs[index] = left.kvs.pop()!;
  if (right.children.length !== 0) {
    right.children.unshift(left.children.pop()!);
  }
};

const pullFromRightChild = <K, V>(node: Node<K, V>, index: number): void => {
  const left = node.children[index];
  const right = node.children[index + 1];
  const kv = node.kvs[index];

  left.kvs.push(kv);
  node.kvs[index] = right.kvs.shift()!;
  if (left.children.length !== 0) {
    left.children.push(right.children.shift()!);
  }
};

const mergeWithChildren = <K, V>(node: Node<K, V>, index: number): void => {
  const left = node.children[index];
  const [right] = node.children.splice(index + 1, 1);
  const [kv] = node.kvs.splice(index, 1);

  left.kvs.push(kv);
  left.kvs.push(...right.kvs);

  if (left.children.length !== 0) {
    left.children.push(...right.children);
  }
};

const removeInternal = <K, V>(node: Node<K, V>, i: number, key: K): KeyValuePair<K, V> => {
  // console.log(`removeInternal, val at ${i}`);
  if (node.children.length === 0) {
    if (isEqual(node.kvs[i][0], key)) {
      // console.log(`at leaf, removing from ${i}`);
      return node.kvs.splice(i, 1)[0];
    }
    throw new Error('should never reach here');
  }

  if (node.children[i].kvs.length > MIN_LEN) {
    // console.log(`left child is above MIN_LEN`);
    pullFromLeftChild(node, i);
    return removeInternal(node.children[i + 1], 0, key);
  }

  if (node.children[i + 1].kvs.length > MIN_LEN) {
    // console.log(`right child is above MIN_LEN`);
    pullFromRightChild(node, i);
    return removeInternal(node.children[i], node.children[i].kvs.length - 1, key);
  }

  // console.log(`merging with children`);
  mergeWithChildren(node, i);
  // printTree(node);
  return removeInternal(node.children[i], MIN_LEN, key);
};

export const _remove = <K, V>(node: Node<K, V>, key: K): KeyValuePair<K, V> | undefined => {
  // console.log(`in node: ${node.kvs.map(([k]) => k).join(', ')}. Num children: ${node.children.length}`);
  // find last index where k <= this.keys[i]
  let i = node.kvs.findLastIndex(([k]) => omniCompare(k, key) !== GT);

  // if node is Leaf
  if (node.children.length === 0) {
    // if found in node, remove it and return
    if (i !== -1 && isEqual(node.kvs[i][0], key)) {
      // console.log(`node is leaf, found at ${i}`);
      return node.kvs.splice(i, 1)[0];
    }
    // console.log('node is leaf, not found');
    // else not found, return
    return undefined;
  }

  // if not leaf and found at root
  if (i !== -1 && isEqual(node.kvs[i][0], key)) {
    // console.log(`node is NOT leaf, found at ${i}, removeInternal`);
    const found = node.kvs[i];
    removeInternal(node, i, key);
    return found;
  }

  // adjust i for children
  i += 1;
  // console.log(`key is in child ${i}: ${node.children[i].kvs.map(([k]) => k).join(', ')}`);

  if (node.children[i].kvs.length > MIN_LEN) {
    // console.log(`diving into child ${i}`);
    return _remove(node.children[i], key);
  }

  // we need our child at i to contain enough entries to safely remove from it
  if (i !== 0 && i + 1 < node.children.length) {
    // if _not_ at either end
    if (node.children[i - 1].kvs.length > MIN_LEN) {
      // console.log('in middle, left is above MIN_LEN');
      // removeSibling(node, i, i - 1);
      pullFromLeftChild(node, i - 1);
    } else if (node.children[i + 1].kvs.length > MIN_LEN) {
      // console.log('in right, left is above MIN_LEN');
      // removeSibling(node, i, i + 1);
      pullFromRightChild(node, i);
    } else {
      // console.log('in middle, merging');
      // removeMerge(node, i, i + 1);
      mergeWithChildren(node, i);
    }
  } else if (i === 0) {
    // is at left end
    if (node.children[i + 1].kvs.length > MIN_LEN) {
      // console.log('at far left, right is above MIN_LEN');
      // removeSibling(node, i, i + 1);
      pullFromRightChild(node, i);
    } else {
      // console.log('at far left, merging');
      // removeMerge(node, i, i + 1);
      mergeWithChildren(node, i);
    }
  } else if (node.children[i - 1].kvs.length > MIN_LEN) {
    // console.log('at far right, left is above MIN_LEN');
    // removeSibling(node, i, i - 1);
    pullFromLeftChild(node, i - 1);
  } else {
    // console.log('at far right, merging');
    // removeMerge(node, i, i - 1);
    mergeWithChildren(node, i - 1);
  }

  // console.log(`diving into child ${i}`);
  if (i > node.children.length - 1) {
    i -= 1;
  }
  return _remove(node.children[i], key);
};

export const remove = <K, V>(root: Node<K, V>, key: K): KeyValuePair<K, V> | undefined => {
  const removed = _remove(root, key);

  // if root is empty, move first child to be new root
  // but only if there are children, which there won't be if there are no more items in the tree
  if (root.kvs.length === 0 && root.children.length !== 0) {
    const [child] = root.children;
    root.kvs = child.kvs;
    root.children = child.children;
  }

  return removed;
};

const _printTree = <K, V>(node: Node<K, V>, level: number): void => {
  const ks = node.kvs.map(([k]) => k).join(' ');
  const space = new Array(level * 2).fill(' ').join('');
  /* eslint-disable no-console */
  console.log(`${space} ${level}: ${ks}`);
  console.log();
  /* eslint-enable no-console */
  level += 1;
  for (const child of node.children) {
    _printTree(child, level);
  }
};

export const printTree = <K, V>(node: Node<K, V>): void => {
  _printTree(node, 0);
};

export const traverse = function* <K, V>(node: Node<K, V>): Generator<KeyValuePair<K, V>> {
  const len = node.kvs.length;
  const isLeaf = node.children.length === 0;
  let i = 0;
  while (i < len) {
    if (!isLeaf) {
      yield* traverse(node.children[i]);
    }
    yield node.kvs[i];
    i++;
  }
  // and final child
  if (!isLeaf) {
    yield* traverse(node.children[i]);
  }
};

export const find = <K, V>(node: Node<K, V>, key: K): KeyValuePair<K, V> | undefined => {
  const i = node.kvs.findLastIndex(([k]) => omniCompare(k, key) !== GT);
  const kv = node.kvs[i];
  if (i !== -1 && isEqual(kv[0], key)) return kv;
  if (node.children.length === 0) return undefined;
  return find(node.children[i + 1], key);
};
