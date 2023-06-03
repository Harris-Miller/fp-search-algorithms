import { findIterate } from './findIterate';
import { leastCostly } from './leastCostly';
import type { SearchState } from './types';
import { fst, isNil, last, snd } from './utils';

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
 * `generalizedSearch`
 *
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
const generalizedSearch = <TState, TKey>(
  makeKey: (state: TState) => TKey,
  better: (oldState: TState[], newState: TState[]) => boolean,
  next: (state: TState) => TState[],
  found: (state: TState) => boolean,
  initial: TState
): TState[] | undefined => {
  const initialState: SearchState<TState, TKey> = {
    current: initial,
    paths: new Map([[makeKey(initial), []]]),
    queue: [],
    visited: new Set([makeKey(initial)])
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

/**
 * `dijkstraAssoc`
 *
 * This API to Dijkstra's algorithm is useful in the common case when next
 * states and their associated transition costs are generated together.
 *
 * Dijkstra's algorithm can be viewed as a generalized search, with the search
 * container being a heap, with the states being compared without regard to
 * cost, with the shorter paths taking precedence over longer ones, and with
 * the stored state being (cost so far, state).
 * This implementation makes that transformation, then transforms that result
 * back into the desired result from `dijkstraAssoc`
 *
 * @param next - function to generate list of neighboring states with associated transition costs given the current state
 * @param found - Predicate to determine if solution found. 'dijkstraAssoc' returns the shortest path to the first state for which this predicate returns `true`
 * @param initial - Initial state
 * @returns [Total cost, list of steps] for the first path found which satisfies the given predicate
 */
export const dijkstraAssoc = <TState>(
  next: (state: TState) => [TState, number][],
  found: (state: TState) => boolean,
  initial: TState
): [number, TState[]] | undefined => {
  const unpack = (packedStates: [number, TState][] | undefined): [number, TState[]] | undefined => {
    if (isNil(packedStates)) return packedStates;
    if (!packedStates.length) return [0, []];
    return [fst(last(packedStates)!), packedStates.map(x => x[1])];
  };

  const nextSt = ([oldCost, st]: [number, TState]) =>
    next(st).map<[number, TState]>(([newSt, newCost]) => [newCost + oldCost, newSt]);

  const r = generalizedSearch<[number, TState], TState>(snd, leastCostly, nextSt, state => found(snd(state)), [
    0,
    initial
  ]);
  return unpack(r);
};

/**
 *
 * @param next
 * @param cost
 * @param found
 * @param initial
 * @returns
 */
export const dijkstra = <TState>(
  next: (state: TState) => TState[],
  cost: (stA: TState, stB: TState) => number,
  found: (state: TState) => boolean,
  initial: TState
): [number, TState[]] | undefined => {
  // create assocNext out of `next` and `cost`
  const assocNext = (st: TState) => next(st).map<[TState, number]>(newSt => [newSt, cost(st, newSt)]);
  // and leverage `dijkstraAssoc` algorithm to do the rest
  return dijkstraAssoc(assocNext, found, initial);
};
