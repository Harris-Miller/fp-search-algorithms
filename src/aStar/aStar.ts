import { last, toString } from 'ramda';

import { createPath } from '../utils/createPath';
import { priorityQueue } from '../utils/priorityQueue';

export function* aStarAssocTraversal<T>(
  getNextStates: (n: T) => [T, number][],
  estimateRemainingCost: (n: T) => number,
  initial: T,
): Generator<[number, T[]]> {
  const cameFrom = new Map<string, T>();
  const initialS = toString(initial);
  const gScore = new Map<string, number>([[initialS, 0]]);
  const fScore = new Map<string, number>([[initialS, estimateRemainingCost(initial)]]);

  const queue = priorityQueue((a: T, b: T) => {
    const aScore = fScore.get(toString(a))!;
    const bScore = fScore.get(toString(b))!;
    return aScore < bScore;
  });
  queue.push(initial);

  while (!queue.isEmpty()) {
    const current = queue.pop()!;
    const currentS = toString(current);

    yield [gScore.get(currentS)!, createPath(cameFrom, current)];

    const nextStates = getNextStates(current);
    for (const [nextState, cost] of nextStates) {
      const nextStateS = toString(nextState);
      const tentativeGScore = gScore.get(currentS)! + cost;

      if (tentativeGScore < (gScore.get(nextStateS) ?? Infinity)) {
        cameFrom.set(nextStateS, current);
        gScore.set(nextStateS, tentativeGScore);
        fScore.set(nextStateS, tentativeGScore + estimateRemainingCost(nextState));
        queue.push(nextState);
      }
    }
  }

  return undefined;
}

export function* aStarTraversal<T>(
  getNextStates: (n: T) => T[],
  getCost: (a: T, b: T) => number,
  estimateRemainingCost: (n: T) => number,
  initial: T,
): Generator<[number, T[]]> {
  const nextAssoc = (state: T) => getNextStates(state).map(n => [n, getCost(state, n)] as [T, number]);
  yield* aStarAssocTraversal(nextAssoc, estimateRemainingCost, initial);
}

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
    const current = last(pathTo)!;
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
    const current = last(pathTo)!;
    visited.push(current);
    if (determineIfFound(current)) return [value, pathTo, visited];
  }
  return undefined;
};
