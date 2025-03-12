import { describe, expect, it } from 'bun:test';
import * as R from 'ramda';

import { PriorityQueue } from '../priorityQueue';

import { toShuffled } from './helpers';

describe('class PriorityQueue', () => {
  it('basic ordering', () => {
    const ordered = R.range(1, 101);
    const randomized = toShuffled(ordered);

    const queue = new PriorityQueue<number>((a, b) => a < b);
    randomized.forEach(v => {
      queue.push(v);
    });

    const size = queue.size();
    const arr = queue.toArray();

    expect(arr).toEqual(ordered);
    expect(queue.size()).toBe(size);
  });

  it('can reorder', () => {
    const ordered = R.range(1, 101);
    const orderingMap = new Map(ordered.map((v, k) => [v, k]));
    const queue = new PriorityQueue<number>((a, b) => orderingMap.get(a)! < orderingMap.get(b)!);
    ordered.forEach(v => {
      queue.push(v);
    });

    expect(queue.toArray()).toEqual(ordered);

    const randomized = toShuffled(ordered);
    randomized.forEach((v, i) => {
      orderingMap.set(v, i);
    });

    queue.reorder();

    expect(queue.toArray()).toEqual(randomized);
  });
});
