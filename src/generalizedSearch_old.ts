import { isNil, toString } from 'ramda';

/**
 * Internal type used to manage search state
 * @private
 */
type SearchState<T> = {
  paths: Record<string, T[]>;
  queue: SearchContainer<T>;
  state: T;
  visited: string[];
};

/**
 * Takes an `initial` seed value and applies `next` to it until either `found` returns `true` or `next` returns `null`
 * @private
 */
const findIterate = <T>(
  next: (a: SearchState<T>) => SearchState<T> | null,
  found: (a: SearchState<T>) => boolean,
  initial: SearchState<T> | null
): SearchState<T> | null => {
  let current = initial;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (isNil(current)) return null;
    if (found(current)) return current;
    current = next(current);
  }
};

export interface SearchContainer<T> {
  pop(): T | undefined;
  push(elm: T): void;
}

export const stack = <A>(): SearchContainer<A> => {
  const inner: A[] = [];
  const pop = () => inner.pop();
  const push = (val: A) => {
    inner.push(val);
  };

  return { pop, push };
};

export const lifoHeap = <K extends object | string | number, A>(): SearchContainer<[K, A]> => {
  // Map retains order of insertion
  const inner: Map<K, A[]> = new Map();

  const pop = () => {
    if (inner.size === 0) {
      return undefined;
    }

    // also use the first key
    const k: K = inner.keys().next().value;
    const xs = inner.get(k) as A[];

    inner.delete(k);

    const a = xs.pop() as A;
    if (xs.length !== 0) {
      inner.set(k, xs);
    }
    return [k, a] as [K, A];
  };

  const push = ([k, a]: [K, A]) => {
    if (!inner.has(k)) {
      inner.set(k, [a]);
    } else {
      const xs = inner.get(k);
      if (!xs) {
        throw new Error('wtf');
      }
      inner.delete(k);
      xs.push(a);
      inner.set(k, xs);
    }
  };

  return { pop, push };
};

/**
 * Moves from one @searchState@ to the next in the generalized search algorithm
 * @private
 */
const nextSearchState =
  <T>(better: (as: T[], bs: T[]) => boolean, next: (state: T) => T[]) =>
  (initial: SearchState<T>): SearchState<T> | null => {
    let current = initial;

    const updateQueuePaths = ([queue, paths]: [T[], Record<string, T[]>], st: T): [T[], Record<string, T[]>] => {
      if (current.visited.includes(toString(st))) return [queue, paths];

      const stepsSoFar = current.paths[toString(current.state)];
      const nextQueue = [st, ...queue];
      const nextStepsSoFar = [st, ...stepsSoFar];
      const nextPaths = { ...paths, [toString(st)]: nextStepsSoFar };

      const path: T[] = paths[toString(st)];

      if (isNil(path)) return [nextQueue, nextPaths];

      return better(path, nextStepsSoFar) ? [nextQueue, nextPaths] : [queue, paths];
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [newQueue, newPaths] = next(current.state).reduce(updateQueuePaths, [current.queue, current.paths]);

      if (!newQueue.length) return null;
      const [newState, ...remainingQueue] = newQueue;

      const newCurrent: SearchState<T> = {
        paths: newPaths,
        queue: remainingQueue,
        state: newState,
        visited: [toString(newState), ...current.visited]
      };

      // console.log(newState);
      // console.log(newCurrent.queue);
      const tuples = newCurrent.queue.map(xs => {
        // @ts-expect-error
        const st = xs[1][1];
        return `(${st.height},(${st.x},${st.y}))`;
      });
      // @ts-expect-error
      const thing = `Just fromList [(${newCurrent.queue[0][0]},[${tuples}])]`;
      console.log(thing);

      if (!current.visited.includes(toString(newState))) return newCurrent;

      current = newCurrent;
    }
  };

/**
 * Workhorse simple search algorithm, generalized over search container
 * and path-choosing function. The idea here is that many search algorithms are
 * at their core the same, with these details substituted. By writing these
 * searches in terms of this function, we reduce the chances of errors sneaking
 * into each separate implementation.
 *
 * @public
 * @param better - Function which when given a choice between an `oldPath` and `newPath` to a state, returns `true` when `newPath` is a "better" path than `oldPath` and should thus be inserted
 * @param next - Function to generate "next" states given a current state
 * @param found - Predicate to determine if solution found. `generalizedSearch` returns a path to the first state for which this predicate returns `true`.
 * @param initial - Initial state
 * @returns First path found to a state matching the predicate, or `null` if no such path exists.
 */
export const generalizedSearch = <T>(
  container: SearchContainer<T>,
  better: (oldState: T[], newState: T[]) => boolean,
  next: (state: T) => T[],
  found: (state: T) => boolean,
  initial: T
): T[] | null => {
  const initialKey = toString(initial);
  const initialSearchState: SearchState<T> = {
    paths: { [initialKey]: [] },
    queue: [],
    state: initial,
    visited: [initialKey]
  };

  const end = findIterate(nextSearchState(better, next), (a: SearchState<T>) => found(a.state), initialSearchState);

  const getSteps = (searchState: SearchState<T> | null) => searchState?.paths[toString(searchState.state)];

  return getSteps(end)?.reverse() ?? null;
};
