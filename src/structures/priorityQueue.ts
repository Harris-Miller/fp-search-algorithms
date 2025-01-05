const TOP = 0;
/* eslint-disable no-bitwise */
// get parent index (intDiv(i, 2))
const parent = (i: number) => ((i + 1) >>> 1) - 1;
// double + 1
const left = (i: number) => (i << 1) + 1;
// double + 2
const right = (i: number) => (i + 1) << 1;
/* eslint-enable no-bitwise */

/**
 *
 * @category Structures
 */
export class PriorityQueue<T> {
  private heap: T[] = [];

  constructor(private comparator: (a: T, b: T) => boolean) {}

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.size() === 0;
  }
  peek() {
    return this.heap[TOP];
  }

  replace(value: T) {
    const replacedValue = this.peek();
    this.heap[TOP] = value;
    this.siftDown();
    return replacedValue;
  }

  push(value: T): void {
    this.heap.push(value);
    this.siftUp();
  }

  pop(): T | undefined {
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
    let i = this.size() - 1;
    while (i > TOP && this.greater(i, parent(i))) {
      this.swap(i, parent(i));
      i = parent(i);
    }
  }

  private siftDown() {
    let i = TOP;
    while (
      (left(i) < this.size() && this.greater(left(i), i)) ||
      (right(i) < this.size() && this.greater(right(i), i))
    ) {
      const maxChild = right(i) < this.size() && this.greater(right(i), left(i)) ? right(i) : left(i);
      this.swap(i, maxChild);
      i = maxChild;
    }
  }
}
