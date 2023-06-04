import { isNil, toString } from 'ramda';

import type { SearchState } from './types';

/**
 * Takes an `initial` seed value and applies `next` to it until either `found` returns `true` or `next` returns `null`
 * @private
 */
const findIterate = <T>(next: (a: T) => T | undefined, found: (a: T) => boolean, initial: T | undefined): T | null => {
  if (isNil(initial)) return null;
  if (found(initial)) return initial;
  return findIterate(next, found, next(initial));
};

// const nextSearchState2 =
//   <T>(better: (as: T[], bs: T[]) => boolean) =>
//   (next: (st: T) => T[]) =>
//   (initial: T): T | undefined => {
//     const state = initial;
//     const initialKey = toString(initial);
//     const paths: Record<string, T[]> = { [initialKey]: [] };
//     const queue = [];
//     const visited = [initialKey];

//     const updateQueuePaths2 = (
//       { queue: oldQueue, paths: oldPaths }: { paths: Record<string, T[]>; queue: T[] },
//       nextState: T
//     ): { paths: Record<string, T[]>; queue: T[] } => {
//       const nextStateKey = toString(nextState);

//       if (visited.includes(nextStateKey)) return { paths: oldPaths, queue: oldQueue };

//       const stepsSoFar = paths[toString(state)];

//       const nextQueue = [...oldQueue, nextState];
//       const nextPaths = { ...paths, [nextStateKey]: [nextState, ...stepsSoFar] };

//       const oldPath = paths[nextStateKey];

//       if (!oldPath) return { paths: nextPaths, queue: nextQueue };

//       return better(oldPath, [nextState, ...stepsSoFar]) ? { paths: nextPaths, queue: nextQueue } : { paths: nextPaths, queue: oldQueue };

//       // console.log('isBetter', isBetter);

//       return isBetter;
//     };

//     // eslint-disable-next-line no-constant-condition
//     while (true) {
//       ({ paths, queue }) = next(state).reduce(updateQueuePaths2(state), { paths, queue });
//     }
//   };

/**
 * Moves from one @searchState@ to the next in the generalized search algorithm
 * @private
 */
const nextSearchState =
  <TState>(better: (as: TState[], bs: TState[]) => boolean, next: (state: TState) => TState[]) =>
  (oldState: SearchState<TState>): SearchState<TState> | undefined => {
    const updateQueuePaths = (
      [oldQueue, oldPaths]: [TState[], Map<string, TState[]>],
      st: TState
    ): [TState[], Map<string, TState[]>] => {
      if (oldState.visited.has(toString(st))) return [oldQueue, oldPaths];

      const stepsSoFar = oldState.paths.get(toString(oldState.current))!;

      const nextQueue = [...oldQueue, st];
      const nextPaths = new Map<string, TState[]>(oldPaths).set(toString(st), [st, ...stepsSoFar]);

      const oldPath = oldPaths.get(toString(st));

      if (!oldPath) return [nextQueue, nextPaths];

      return better(oldPath, [st, ...stepsSoFar]) ? [nextQueue, nextPaths] : [oldQueue, oldPaths];
    };

    const newQueuePaths = next(oldState.current).reduce(updateQueuePaths, [oldState.queue, oldState.paths]);
    const [newQueue, newPaths] = newQueuePaths;

    if (!newQueue.length) return undefined;

    const [newCurrent, ...remainingQueue] = newQueue;
    const newState: SearchState<TState> = {
      current: newCurrent,
      paths: newPaths,
      queue: remainingQueue,
      visited: new Set<string>(oldState.visited).add(toString(newCurrent))
    };

    return oldState.visited.has(toString(newState.current)) ? nextSearchState(better, next)(newState) : newState;
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
export const generalizedSearch = <TState>(
  better: (oldState: TState[], newState: TState[]) => boolean,
  next: (state: TState) => TState[],
  found: (state: TState) => boolean,
  initial: TState
): TState[] | undefined => {
  const initialKey = toString(initial);
  const initialState: SearchState<TState> = {
    current: initial,
    paths: new Map([[initialKey, []]]),
    queue: [],
    visited: new Set([initialKey])
  };

  const end = findIterate(nextSearchState(better, next), (a: SearchState<TState>) => found(a.current), initialState);

  const getSteps = (searchState: SearchState<TState> | null) => searchState?.paths.get(toString(searchState.current));

  return getSteps(end)?.reverse();
};
