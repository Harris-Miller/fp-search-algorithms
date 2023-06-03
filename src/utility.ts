import { isNil, tail, zipWith } from './fp';
import type { SearchState } from './types';

/**
 * `nextSearchState
 *
 * Moves from one @searchState@ to the next in the generalized search algorithm
 *
 * @private
 * @param better
 * @param makeKey
 * @param next
 * @returns
 */
export const nextSearchState =
  <TState, TKey>(
    better: (as: TState[], bs: TState[]) => boolean,
    makeKey: (state: TState) => TKey,
    next: (state: TState) => TState[]
  ) =>
  (oldState: SearchState<TState, TKey>): SearchState<TState, TKey> | undefined => {
    const updateQueuePaths = (
      [oldQueue, oldPaths]: [TState[], Map<TKey, TState[]>],
      st: TState
    ): [TState[], Map<TKey, TState[]>] => {
      if (oldState.visited.has(makeKey(st))) return [oldQueue, oldPaths];

      const stepsSoFar = oldState.paths.get(makeKey(oldState.current))!;

      const nextQueue = [...oldQueue, st];
      const nextPaths = oldPaths.set(makeKey(st), [st, ...stepsSoFar]);

      const oldPath = oldPaths.get(makeKey(st));

      if (!oldPath) return [nextQueue, nextPaths];

      return better(oldPath, [st, ...stepsSoFar]) ? [nextQueue, nextPaths] : [oldQueue, nextPaths];
    };

    const newQueuePaths = next(oldState.current).reduce(updateQueuePaths, [oldState.queue, oldState.paths]);
    const [newQueue, newPaths] = newQueuePaths;

    if (!newQueue.length) return undefined;

    const [newCurrent, ...remainingQueue] = newQueue;
    const newState: SearchState<TState, TKey> = {
      current: newCurrent,
      paths: newPaths,
      queue: remainingQueue,
      visited: oldState.visited.add(makeKey(newCurrent))
    };

    return oldState.visited.has(makeKey(newState.current))
      ? nextSearchState(better, makeKey, next)(newState)
      : newState;
  };

/**
 * Takes an `initial` seed value and applies `next` to it
 * until either `found` returns `true` or `next` returns null
 * @private
 */
export const findIterate = <T>(
  next: (a: T) => T | undefined,
  found: (a: T) => boolean,
  initial: T | undefined
): T | null => {
  if (isNil(initial)) return null;
  if (found(initial)) return initial;
  return findIterate(next, found, next(initial));
};

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

/**
 * Gives a list of the incremental costs
 * going from state to state along the path given in `states`, using the cost
 * function given by `cost` function. Note that the paths returned by the searches
 * in this module do not include the initial state, so if you want the
 * incremental costs along a `path` returned by one of these searches, you
 * want to use `incrementalCosts(cost_fn, [initial, ...path])`
 *
 * @public
 * @param cost - Function to generate list of costs between neighboring states
 * @param states - A path, given as a list of adjacent states, along which to find the incremental costs
 * @returns List of incremental costs along given path
 */
export const incrementalCost = <T>(cost: (a: T, b: T) => number, states: T[]): number[] =>
  zipWith(cost, states, tail(states));

/**
 * Predicate@ streams the elements generate by `next` into a
 * list, removing elements which satisfy `predicate`. This is useful for the
 * common case when you want to logically separate your search's `next` function
 * from some way of determining when you've reached a dead end.
 *
 * @public
 * @param next - Function to generate next states
 * @param predicate - Predicate to prune on
 * @returns Version of `next` which excludes elements satisfying `predicate`
 */
export const pruning =
  <T>(next: (a: T) => T[], predicate: (a: T) => boolean) =>
  (a: T) =>
    next(a).filter(x => !predicate(x));
