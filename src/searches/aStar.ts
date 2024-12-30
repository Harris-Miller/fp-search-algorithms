import { HashMap } from '../structures/hashMap';
import { PriorityQueue } from '../structures/priorityQueue';

import { createPath } from './internal/createPath';

/**
 *
 * @public
 * @category AStar
 * @param getNextStates
 * @param estimateRemainingCost
 * @param initial
 * @returns
 */
export const aStarAssocTraversal = function* <T>(
  getNextStates: (n: T) => [T, number][],
  estimateRemainingCost: (n: T) => number,
  initial: T,
): Generator<[number, T[]]> {
  const cameFrom = new HashMap<T, T>();
  const gScore = new HashMap<T, number>().set(initial, 0);
  const fScore = new HashMap<T, number>().set(initial, estimateRemainingCost(initial));

  const queue = new PriorityQueue((a: T, b: T) => {
    const aScore = fScore.get(a)!;
    const bScore = fScore.get(b)!;
    return aScore < bScore;
  });
  queue.push(initial);

  while (!queue.isEmpty()) {
    const current = queue.pop()!;

    yield [gScore.get(current)!, createPath(cameFrom, current)];

    const nextStates = getNextStates(current);
    for (const [nextState, cost] of nextStates) {
      const tentativeGScore = gScore.get(current)! + cost;

      if (tentativeGScore < (gScore.get(nextState) ?? Infinity)) {
        cameFrom.set(nextState, current);
        gScore.set(nextState, tentativeGScore);
        fScore.set(nextState, tentativeGScore + estimateRemainingCost(nextState));
        queue.push(nextState);
      }
    }
  }

  return undefined;
};

/**
 *
 * @public
 * @category AStar
 * @param getNextStates
 * @param getCost
 * @param estimateRemainingCost
 * @param initial
 */
export const aStarTraversal = function* <T>(
  getNextStates: (n: T) => T[],
  getCost: (a: T, b: T) => number,
  estimateRemainingCost: (n: T) => number,
  initial: T,
): Generator<[number, T[]]> {
  const nextAssoc = (state: T) => getNextStates(state).map(n => [n, getCost(state, n)] as [T, number]);
  yield* aStarAssocTraversal(nextAssoc, estimateRemainingCost, initial);
};

/**
 * Performs a best-first search
 * using the A* search algorithm, starting with the state @initial@, generating
 * neighboring states and their associated costs with @next@, and an estimate of
 * the remaining cost with @remaining@. This returns a path to a state for which
 * @found@ returns 'True'. If @remaining@ is strictly a lower bound on the
 * remaining cost to reach a solved state, then the returned path is the
 * shortest path. Returns 'Nothing' if no path to a solved state is possible.
 *
 * @public
 * @category AStar
 * @param getNextStates - Function to generate list of neighboring states with associated transition costs given the current state
 * @param estimateRemainingCost - Estimate on remaining cost given a state
 * @param determineIfFound - Predicate to determine if solution found. `aStar` returns the shortest path to the first state for which this predicate returns `true`
 * @param start - starting state
 * @returns [Total cost, list of steps] for the first path found which satisfies the given predicate
 */
export const aStarAssoc = <T>(
  getNextStates: (n: T) => [T, number][],
  estimateRemainingCost: (n: T) => number,
  determineIfFound: (a: T) => boolean,
  start: T,
): [number, T[], T[]] | undefined => {
  const visited: T[] = [];
  for (const [value, pathTo] of aStarAssocTraversal(getNextStates, estimateRemainingCost, start)) {
    const current = pathTo[pathTo.length - 1];
    visited.push(current);
    if (determineIfFound(current)) return [value, pathTo, visited];
  }
  return undefined;
};

/**
 * Performs a best-first search
 * using the A* search algorithm, starting with the state @initial@, generating
 * neighboring states with `next`, their cost with @cost@, and an estimate of
 * the remaining cost with `remaining`. This returns a path to a state for which
 * `found` returns `true`. If `remaining` is strictly a lower bound on the
 * remaining cost to reach a solved state, then the returned path is the
 * shortest path. Returns `undefined` if no path to a solved state is possible.
 *
 * @public
 * @category AStar
 * @param getNextStates - Function to generate list of neighboring states given the current state
 * @param getCost - Function to generate transition costs between neighboring states
 * @param estimateRemainingCost - Estimate on remaining cost given a state
 * @param determineIfFound - Predicate to determine if solution found. `aStar` returns the shortest path to the first state for which this predicate returns `true`
 * @param initial - Initial state
 * @returns - [Total cost, list of steps] for the first path found which satisfies the given predicate
 */
export const aStar = <T>(
  getNextStates: (n: T) => T[],
  getCost: (a: T, b: T) => number,
  estimateRemainingCost: (n: T) => number,
  determineIfFound: (a: T) => boolean,
  initial: T,
): [number, T[], T[]] | undefined => {
  const visited: T[] = [];
  for (const [value, pathTo] of aStarTraversal(getNextStates, getCost, estimateRemainingCost, initial)) {
    const current = pathTo[pathTo.length - 1];
    visited.push(current);
    if (determineIfFound(current)) return [value, pathTo, visited];
  }
  return undefined;
};
