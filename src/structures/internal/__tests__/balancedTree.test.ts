/* eslint-disable no-param-reassign */
import { describe, expect, it } from 'bun:test';
import * as R from 'ramda';

import { createEmptyNode, find, insert, printTree, remove, traverse } from '../balancedTree';
import type { KeyValuePair, Node } from '../balancedTree';

const shuffle = <T>(array: T[]): void => {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
};

const createdRootManually = (): Node<number, undefined> => ({
  children: [
    {
      children: [
        {
          children: [],
          kvs: [5].map(k => [k, undefined]),
        },
        {
          children: [],
          kvs: [15].map(k => [k, undefined]),
        },
      ],
      kvs: [10].map(k => [k, undefined]),
    },
    {
      children: [
        {
          children: [],
          kvs: [25, 28].map(k => [k, undefined]),
        },
        {
          children: [],
          kvs: [31, 32].map(k => [k, undefined]),
        },
        {
          children: [],
          kvs: [35].map(k => [k, undefined]),
        },
      ],
      kvs: [30, 33].map(k => [k, undefined]),
    },
    {
      children: [
        {
          children: [],
          kvs: [45].map(k => [k, undefined]),
        },
        {
          children: [],
          kvs: [55].map(k => [k, undefined]),
        },
        {
          children: [],
          kvs: [65].map(k => [k, undefined]),
        },
      ],
      kvs: [50, 60].map(k => [k, undefined]),
    },
  ],
  kvs: [20, 40].map(k => [k, undefined]),
});

describe('balancedTree', () => {
  it('keep in order', () => {
    let root = createEmptyNode<number, undefined>();

    const keys = R.range(0, 100);

    keys.forEach(k => {
      root = insert(root, k, undefined, { val: false });
    });

    const entries = traverse(root)
      .toArray()
      .map(([k]) => k);

    expect(entries).toEqual(keys);
  });

  it('can find all entries', () => {
    let root = createEmptyNode<number, undefined>();

    const keys = R.range(0, 100);

    keys.forEach(k => {
      root = insert(root, k, undefined, { val: false });
    });

    keys.forEach(k => {
      expect(find(root, k)).not.toBeUndefined();
    });
  });

  it('can add and remove all without issue', () => {
    const root = createdRootManually();

    const entries = traverse(root)
      .toArray()
      .map(([k]) => k);

    shuffle(entries);

    entries.forEach(k => {
      try {
        remove(root, k);
      } catch (e) {
        printTree(root);
        console.log(entries);
        throw e;
      }
    });

    expect(root.children).toBeEmpty();
    expect(root.kvs).toBeEmpty();
  });

  it.skip('use for testing failures', () => {
    const root = createdRootManually();

    const weirdOrder = [40, 20, 45, 30, 5, 28, 10, 25, 35, 55, 33, 15, 32, 60, 65, 50, 31];

    Iterator.from(weirdOrder)
      .take(17)
      .forEach(k => {
        console.log(`removing ${k}`);
        try {
          printTree(root);
          remove(root, k);
        } catch (e) {
          printTree(root);
          throw e;
        }
        console.log();
      });

    printTree(root);

    // expect(root.children).toBeEmpty();
    // expect(root.kvs).toBeEmpty();
  });
});
