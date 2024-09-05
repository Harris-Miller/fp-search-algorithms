const TOP = 0;
/* eslint-disable no-bitwise */
// get parent index
const parent = (i: number) => ((i + 1) >>> 1) - 1;
// double + 1
const left = (i: number) => (i << 1) + 1;
// double + 2
const right = (i: number) => (i + 1) << 1;
/* eslint-enable no-bitwise */

export class PriorityQueue<T> {
  private heap: T[] = [];

  constructor(private comparator: (a: T, b: T) => boolean) {}

  public size() {
    return this.heap.length;
  }

  public isEmpty() {
    return this.size() === 0;
  }
  public peek() {
    return this.heap[TOP];
  }

  public replace(value: T) {
    const replacedValue = this.peek();
    this.heap[TOP] = value;
    this.siftDown();
    return replacedValue;
  }

  public push(value: T): void {
    this.heap.push(value);
    this.siftUp();
  }

  public pop(): T | undefined {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > TOP) {
      this.swap(TOP, bottom);
    }
    this.heap.pop();
    this.siftDown();
    return poppedValue;
  }

  private greater(i: number, j: number) {
    return this.comparator(this.heap[i], this.heap[j]);
  }

  private swap = (i: number, j: number) => {
    const a = this.heap[i];
    const b = this.heap[j];
    this.heap[j] = a;
    this.heap[i] = b;
  };

  private siftUp() {
    let node = this.size() - 1;
    while (node > TOP && this.greater(node, parent(node))) {
      this.swap(node, parent(node));
      node = parent(node);
    }
  }

  private siftDown() {
    let node = TOP;
    while (
      (left(node) < this.size() && this.greater(left(node), node)) ||
      (right(node) < this.size() && this.greater(right(node), node))
    ) {
      const maxChild = right(node) < this.size() && this.greater(right(node), left(node)) ? right(node) : left(node);
      this.swap(node, maxChild);
      node = maxChild;
    }
  }
}

export const priorityQueue = <T>(comparator: (a: T, b: T) => boolean) => {
  return new PriorityQueue(comparator);
};
