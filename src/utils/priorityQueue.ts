const top = 0;
/* eslint-disable no-bitwise */
const parent = (i: number) => ((i + 1) >>> 1) - 1;
// double - 1
const left = (i: number) => (i << 1) + 1;
// double + 2
const right = (i: number) => (i + 1) << 1;
/* eslint-enable no-bitwise */

export const priorityQueue = <T>(comparator: (a: T, b: T) => boolean) => {
  const heap: T[] = [];

  const size = () => heap.length;
  const isEmpty = () => size() === 0;
  const peek = () => heap[top];

  const greater = (i: number, j: number) => comparator(heap[i], heap[j]);

  const swap = (i: number, j: number) => {
    const a = heap[i];
    const b = heap[j];
    heap[j] = a;
    heap[i] = b;
  };

  const siftUp = () => {
    let node = size() - 1;
    while (node > top && greater(node, parent(node))) {
      swap(node, parent(node));
      node = parent(node);
    }
  };

  const siftDown = () => {
    let node = top;
    while ((left(node) < size() && greater(left(node), node)) || (right(node) < size() && greater(right(node), node))) {
      const maxChild = right(node) < size() && greater(right(node), left(node)) ? right(node) : left(node);
      swap(node, maxChild);
      node = maxChild;
    }
  };

  const replace = (value: T) => {
    const replacedValue = peek();
    heap[top] = value;
    siftDown();
    return replacedValue;
  };

  const push = (value: T): void => {
    heap.push(value);
    siftUp();
  };

  const pop = (): T | undefined => {
    const poppedValue = peek();
    const bottom = size() - 1;
    if (bottom > top) {
      swap(top, bottom);
    }
    heap.pop();
    siftDown();
    return poppedValue;
  };

  return { isEmpty, peek, pop, push, replace, size };
};
