import type { Container } from './utils/containers';

/**
 * Internal type used to manage search state
 * @private
 */
export type SearchState<T> = {
  current: T;
  paths: Map<string, T[]>;
  queue: Container<T>;
  visited: Set<string>;
};

const findIterate = <T>(
  next: (state: T) => T | undefined,
  found: (state: T) => boolean,
  initial: T | undefined
): T | undefined => {
  if (initial === undefined) return undefined;
  return found(initial) ? initial : findIterate(next, found, next(initial));
};

const nextSearchState =
  <T>(better: (left: T[], right: T[]) => boolean, makeKey: (state: T) => string, next: (state: T) => T[]) =>
  (old: SearchState<T>): SearchState<T> | undefined => {
    const updateQueuePaths = (
      [queue, paths]: [Container<T>, Map<string, T[]>],
      st: T
    ): [Container<T>, Map<string, T[]>] => {
      const key = makeKey(st);
      if (old.visited.has(key)) return [queue, paths];

      const stepsSoFar = old.paths.get(key) ?? [];
      const nextSteps = [st, ...stepsSoFar];
      const oldPath = paths.get(key);

      if (oldPath !== undefined && !better(oldPath, nextSteps)) return [queue, paths];

      // q' = push old_queue st
      // ps' = Map.insert (mk_key st) (st : steps_so_far) old_paths
      queue.push(st);
      paths.set(key, nextSteps);
      const newPath = new Map(paths).set(key, nextSteps);
      return [queue, newPath] as [Container<T>, Map<string, T[]>];
    };

    const [newQueue, newPaths] = next(old.current).reduce<[Container<T>, Map<string, T[]>]>(updateQueuePaths, [
      old.queue,
      old.paths
    ] as [Container<T>, Map<string, T[]>]);

    const newCurrent = newQueue.pop();

    if (newCurrent === undefined) return undefined;

    const hasPreviouslyVisited = old.visited.has(makeKey(newCurrent));

    const newState: SearchState<T> = {
      current: newCurrent,
      paths: newPaths,
      queue: newQueue,
      visited: old.visited.add(makeKey(newCurrent))
    };

    return hasPreviouslyVisited ? nextSearchState(better, makeKey, next)(newState) : newState;
  };

export const generalizedSearch = <T>(
  empty: Container<T>,
  makeKey: (state: T) => string,
  better: (left: T[], right: T[]) => boolean,
  next: (state: T) => T[],
  found: (state: T) => boolean,
  initial: T
) => {
  const key = makeKey(initial);
  const initialSearchState: SearchState<T> = {
    current: initial,
    paths: new Map([[key, []]]),
    queue: empty,
    visited: new Set([key])
  };

  const end = findIterate(
    nextSearchState(better, makeKey, next),
    (searchState: SearchState<T>) => found(searchState.current),
    initialSearchState
  );

  if (end === undefined) return undefined;

  const getSteps = (searchState: SearchState<T>) => searchState.paths.get(makeKey(searchState.current))!;

  return [...getSteps(end)].reverse();
};
