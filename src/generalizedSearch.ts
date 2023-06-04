import { isNil, toString } from 'ramda';

/**
 * Internal type used to manage search state
 * @private
 */
type SearchState<TState> = {
  paths: Record<string, TState[]>;
  queue: TState[];
  state: TState;
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
  <TState>(better: (as: TState[], bs: TState[]) => boolean, next: (state: TState) => TState[]) =>
  (initial: SearchState<TState>): SearchState<TState> | undefined => {
    let current = initial;

    const updateQueuePaths = (
      [oldQueue, oldPaths]: [TState[], Record<string, TState[]>],
      st: TState
    ): [TState[], Record<string, TState[]>] => {
      if (current.visited.includes(toString(st))) return [oldQueue, oldPaths];

      const stepsSoFar = current.paths[toString(current.state)];

      const nextQueue = [...oldQueue, st];
      const nextPaths = { ...oldPaths, [toString(st)]: [st, ...stepsSoFar] };

      const oldPath = oldPaths[toString(st)];

      if (!oldPath) return [nextQueue, nextPaths];

      return better(oldPath, [st, ...stepsSoFar]) ? [nextQueue, nextPaths] : [oldQueue, oldPaths];
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [newQueue, newPaths] = next(current.state).reduce(updateQueuePaths, [current.queue, current.paths]);

      if (!newQueue.length) return undefined;
      const [newCurrent, ...remainingQueue] = newQueue;

      const newState: SearchState<TState> = {
        paths: newPaths,
        queue: remainingQueue,
        state: newCurrent,
        visited: [...current.visited, toString(newCurrent)]
      };

      if (!current.visited.includes(toString(newCurrent))) return newState;

      current = newState;
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

export const generalizedSearch = <TState>(
  better: (oldState: TState[], newState: TState[]) => boolean,
  next: (state: TState) => TState[],
  found: (state: TState) => boolean,
  initial: TState
): TState[] | undefined => {
  const initialKey = toString(initial);
  const initialSearchState: SearchState<TState> = {
    paths: { [initialKey]: [] },
    queue: [],
    state: initial,
    visited: [initialKey]
  };

  const end = findIterate(
    nextSearchState(better, next),
    (a: SearchState<TState>) => found(a.state),
    initialSearchState
  );

  const getSteps = (searchState: SearchState<TState> | null) => searchState?.paths[toString(searchState.state)];

  return getSteps(end)?.reverse();
};
