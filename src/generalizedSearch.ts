import { isNil, toString } from 'ramda';

/**
 * Internal type used to manage search state
 * @private
 */
type SearchState<T> = {
  paths: Record<string, T[]>;
  queue: T[];
  state: T;
  visited: string[];
};

/**
 * Takes an `initial` seed value and applies `next` to it until either `found` returns `true` or `next` returns `null`
 * @private
 */
const findIterate = <T>(next: (a: T) => T | undefined, found: (a: T) => boolean, initial: T | undefined): T | null => {
  let current = initial;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (isNil(current)) return null;
    if (found(current)) return current;
    current = next(current);
  }
};

/**
 * Moves from one @searchState@ to the next in the generalized search algorithm
 * @private
 */
const nextSearchState =
  <T>(better: (as: T[], bs: T[]) => boolean, next: (state: T) => T[]) =>
  (initial: SearchState<T>): SearchState<T> | undefined => {
    let current = initial;

    const updateQueuePaths = ([queue, paths]: [T[], Record<string, T[]>], st: T): [T[], Record<string, T[]>] => {
      if (current.visited.includes(toString(st))) return [queue, paths];

      const stepsSoFar = current.paths[toString(current.state)];
      const nextQueue = [st, ...queue];
      const nextPaths = { ...paths, [toString(st)]: [st, ...stepsSoFar] };

      const path: T[] = paths[toString(st)];

      if (isNil(path)) return [nextQueue, nextPaths];

      return better(path, [st, ...stepsSoFar]) ? [nextQueue, nextPaths] : [queue, paths];
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [newQueue, newPaths] = next(current.state).reduce(updateQueuePaths, [current.queue, current.paths]);

      if (!newQueue.length) return undefined;
      const [newState, ...remainingQueue] = newQueue;

      const newCurrent: SearchState<T> = {
        paths: newPaths,
        queue: remainingQueue,
        state: newState,
        visited: [...current.visited, toString(newState)]
      };

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
 * @returns First path found to a state matching the predicate, or `undefined` if no such path exists.
 */

export const generalizedSearch = <T>(
  better: (oldState: T[], newState: T[]) => boolean,
  next: (state: T) => T[],
  found: (state: T) => boolean,
  initial: T
): T[] | undefined => {
  const initialKey = toString(initial);
  const initialSearchState: SearchState<T> = {
    paths: { [initialKey]: [] },
    queue: [],
    state: initial,
    visited: [initialKey]
  };

  const end = findIterate(nextSearchState(better, next), (a: SearchState<T>) => found(a.state), initialSearchState);

  const getSteps = (searchState: SearchState<T> | null) => searchState?.paths[toString(searchState.state)];

  return getSteps(end)?.reverse();
};
