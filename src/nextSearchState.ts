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
