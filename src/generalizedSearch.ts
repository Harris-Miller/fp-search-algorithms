import type { SearchState } from './types';
import { isNil } from './utils';

/**
 * Takes an `initial` seed value and applies `next` to it until either `found` returns `true` or `next` returns `null`
 * @private
 */
const findIterate = <T>(next: (a: T) => T | undefined, found: (a: T) => boolean, initial: T | undefined): T | null => {
  if (isNil(initial)) return null;
  if (found(initial)) return initial;
  return findIterate(next, found, next(initial));
};

/**
 * Moves from one @searchState@ to the next in the generalized search algorithm
 * @private
 */
const nextSearchState =
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
 * Workhorse simple search algorithm, generalized over search container
 * and path-choosing function. The idea here is that many search algorithms are
 * at their core the same, with these details substituted. By writing these
 * searches in terms of this function, we reduce the chances of errors sneaking
 * into each separate implementation.
 *
 * @param makeKey - Function to turn a @state@ into a key by which states will be compared when determining whether a state has be enqueued and / or visited
 * @param better - Function which when given a choice between an `oldPath` and `newPath` to a state, returns `true` when `newPath` is a "better" path than `oldPath` and should thus be inserted
 * @param next - Function to generate "next" states given a current state
 * @param found - Predicate to determine if solution found. `generalizedSearch` returns a path to the first state for which this predicate returns `true`.
 * @param initial - Initial state
 * @returns First path found to a state matching the predicate, or `undefined` if no such path exists.
 */
export const generalizedSearch = <TState, TKey>(
  makeKey: (state: TState) => TKey,
  better: (oldState: TState[], newState: TState[]) => boolean,
  next: (state: TState) => TState[],
  found: (state: TState) => boolean,
  initial: TState
): TState[] | undefined => {
  const initialKey = makeKey(initial);
  const initialState: SearchState<TState, TKey> = {
    current: initial,
    paths: new Map([[initialKey, []]]),
    queue: [],
    visited: new Set([initialKey])
  };

  const end = findIterate(
    nextSearchState(better, makeKey, next),
    (a: SearchState<TState, TKey>) => found(a.current),
    initialState
  );

  const getSteps = (searchState: SearchState<TState, TKey> | null) =>
    searchState?.paths.get(makeKey(searchState.current));

  return getSteps(end)?.reverse();
};
