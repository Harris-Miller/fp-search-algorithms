/**
 * Abstraction of a SearchContainer that just has pop and push methods
 */
export interface SearchContainer<T> {
  pop(): T | undefined;
  push(elm: T): void;
}

/**
 * Abstracted stack that implements SearchContainer
 */
export const stack = <A>(): SearchContainer<A> => {
  const inner: A[] = [];
  const pop = () => inner.pop();
  const push = (val: A) => {
    inner.push(val);
  };

  return { pop, push };
};

/**
 * Last in, First Out Heap, implements SearchContainer
 */
export const lifoHeap = <A>(): SearchContainer<[number, A]> => {
  // Map retains order of insertion
  const inner: Map<number, A[]> = new Map();

  const pop = () => {
    if (inner.size === 0) {
      return undefined;
    }

    // use min key
    const k: number = [...inner.keys()].sort()[0];
    const xs = inner.get(k) as A[];
    const a = xs.pop() as A;
    if (!xs.length) inner.delete(k);
    return [k, a] as [number, A];
  };

  const push = ([k, a]: [number, A]) => {
    const xs = inner.get(k);
    if (!xs) {
      inner.set(k, [a]);
    } else {
      xs.push(a);
    }
  };

  return { pop, push };
};

export const fst = <A, B>(tuple: [A, B]): A => tuple[0];
export const snd = <A, B>(tuple: [A, B]): B => tuple[1];

/**
 * Utility function to be used with 'dijkstra'-like functions.
 * It returns `true` when the cost of `pathsA` less than the cost of `pathsB`,
 * where the total costs are the first elements in each tuple in each path
 *
 * @private
 * @param pathsA
 * @param pathsB
 * @returns {boolean}
 */
export const leastCostly = <A, B>(pathsA: [A, B][], pathsB: [A, B][]): boolean => {
  if (!pathsB.length) return true;
  if (!pathsA.length) return false;
  return pathsB[0][0] < pathsA[0][0];
};
