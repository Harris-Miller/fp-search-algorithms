import { last } from 'ramda';

import { createPath } from '../utils/createPath';
import { priorityQueue } from '../utils/priorityQueue';

export function* aStarAssocTraversal<T>(
  next: (n: T) => [T, number][],
  remaining: (n: T) => number,
  start: T
): Generator<[number, T[]]> {
  const cameFrom = new Map<T, T>();
  const gScore = new Map<T, number>([[start, 0]]);
  const fScore = new Map<T, number>([[start, remaining(start)]]);

  const queue = priorityQueue((a: T, b: T) => {
    const aScore = fScore.get(a)!;
    const bScore = fScore.get(b)!;
    return aScore < bScore;
  });
  queue.push(start);

  while (!queue.isEmpty()) {
    const current = queue.pop()!;

    yield [gScore.get(current)!, createPath(cameFrom, current)];

    const neighbors = next(current);
    for (const [neighbor, nCost] of neighbors) {
      const tentativeGScore = gScore.get(current)! + nCost;

      if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + remaining(neighbor));
        queue.push(neighbor);
      }
    }
  }

  return undefined;
}

export function* aStarTraversal<T>(
  next: (n: T) => T[],
  cost: (a: T, b: T) => number,
  remaining: (n: T) => number,
  start: T
): Generator<[number, T[]]> {
  const nextAssoc = (state: T) => next(state).map(n => [n, cost(state, n)] as [T, number]);
  yield* aStarAssocTraversal(nextAssoc, remaining, start);
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
 * @param next - Function to generate list of neighboring states with associated transition costs given the current state
 * @param remaining - Estimate on remaining cost given a state
 * @param found - Predicate to determine if solution found. `aStar` returns the shortest path to the first state for which this predicate returns `true`
 * @param start - starting state
 * @returns [Total cost, list of steps] for the first path found which satisfies the given predicate
 */
export const aStarAssoc = <T>(
  next: (n: T) => [T, number][],
  remaining: (n: T) => number,
  found: (a: T) => boolean,
  start: T
): [number, T[], T[]] | undefined => {
  const visited: T[] = [];
  for (const [value, pathTo] of aStarAssocTraversal(next, remaining, start)) {
    const current = last(pathTo)!;
    visited.push(current);
    if (found(current)) return [value, pathTo, visited];
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
 * @param next - Function to generate list of neighboring states given the current state
 * @param cost - Function to generate transition costs between neighboring states
 * @param remaining - Estimate on remaining cost given a state
 * @param found - Predicate to determine if solution found. `aStar` returns the shortest path to the first state for which this predicate returns `true`
 * @param initial - Initial state
 * @returns - [Total cost, list of steps] for the first path found which satisfies the given predicate
 */
export const aStar = <T>(
  next: (n: T) => T[],
  cost: (a: T, b: T) => number,
  remaining: (n: T) => number,
  found: (a: T) => boolean,
  start: T
): [number, T[], T[]] | undefined => {
  const visited: T[] = [];
  for (const [value, pathTo] of aStarTraversal(next, cost, remaining, start)) {
    const current = last(pathTo)!;
    visited.push(current);
    if (found(current)) return [value, pathTo, visited];
  }
  return undefined;
};
