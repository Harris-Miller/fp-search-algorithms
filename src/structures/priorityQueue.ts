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

  constructor(
    private comparator: (a: T, b: T) => boolean,
    private equals: (a: T, b: T) => boolean = (a, b) => a === b,
  ) {}

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.size() === 0;
  }

  peek() {
    return this.heap[0];
  }

  has(other: T): boolean {
    return this.heap.find(x => this.equals(x, other)) != null;
  }

  replace(value: T) {
    const replacedValue = this.peek();
    this.heap[0] = value;
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
    if (bottom > 0) {
      this.swap(0, bottom);
    }
    this.heap.pop();
    this.siftDown();
    return poppedValue;
  }

  reorder(): void {
    const l = this.heap.length;
    const original = [...this.heap];
    this.heap = [];
    for (let i = 0; i < l; i += 1) {
      this.push(original[i]);
    }
  }

  toArray(): T[] {
    const copy = [...this.heap];
    const arr: T[] = [];
    while (this.size() > 0) {
      arr.push(this.pop()!);
    }
    this.heap = copy;
    return arr;
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
    while (i > 0 && this.greater(i, parent(i))) {
      this.swap(i, parent(i));
      i = parent(i);
    }
  }

  private siftDown() {
    let i = 0;
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
