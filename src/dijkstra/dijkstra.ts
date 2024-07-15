import { last, toString } from 'ramda';

import { createPath } from '../utils/createPath';
import { priorityQueue } from '../utils/priorityQueue';

export function* dijkstraAssocTraversal<T>(
  getNextStates: (state: T) => [T, number][],
  initial: T,
): Generator<[number, T[]]> {
  const prevMap = new Map<string, T>();
  const costMap = new Map<string, number>([[toString(initial), 0]]);

  const visited = new Set<T>();

  const queue = priorityQueue<T>((a: T, b: T) => {
    const aCost = costMap.get(toString(a)) ?? Infinity;
    const bCost = costMap.get(toString(b)) ?? Infinity;
    return aCost < bCost;
  });

  queue.push(initial);

  while (!queue.isEmpty()) {
    const current = queue.pop()!;
    const currentS = toString(current);

    yield [costMap.get(currentS)!, createPath(prevMap, current)];

    visited.add(current);

    const visitCost = costMap.get(currentS) ?? Infinity;

    const nextStates = getNextStates(current);
    for (const [nextState, nextCost] of nextStates) {
      const nextStateS = toString(nextState);
      const altCost = visitCost + nextCost;
      if (altCost < (costMap.get(nextStateS) ?? Infinity)) {
        costMap.set(nextStateS, altCost);
        prevMap.set(nextStateS, current);
        queue.push(nextState);
      }
    }
  }

  return undefined;
}

export function* dijkstraTraversal<T>(
  getNextStates: (state: T) => T[],
  getCost: (from: T, to: T) => number,
  initial: T,
): Generator<[number, T[]]> {
  const nextAssoc = (state: T) => getNextStates(state).map(n => [n, getCost(state, n)] as [T, number]);
  yield* dijkstraAssocTraversal(nextAssoc, initial);
}

/**
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
 * @public
 * @param getNextStates - function to generate list of neighboring states with associated transition costs given the current state
 * @param determineIfFound - Predicate to determine if solution found. 'dijkstraAssoc' returns the shortest path to the first state for which this predicate returns `true`
 * @param initial - Initial state
 * @returns [Total cost, list of steps] for the first path found which satisfies the given predicate
 */
export const dijkstraAssoc = <T>(
  getNextStates: (state: T) => [T, number][],
  determineIfFound: (state: T) => boolean,
  initial: T,
): [number, T[], T[]] | undefined => {
  const visited: T[] = [];
  for (const [value, pathTo] of dijkstraAssocTraversal(getNextStates, initial)) {
    const current = last(pathTo)!;
    visited.push(current);
    if (determineIfFound(current)) return [value, pathTo, visited];
  }
  return undefined;
};

/**
 * Performs a shortest-path search over
 * a set of states using Dijkstra's algorithm, starting with `initial`,
 * generating neighboring states with `next`, and their incremental costs with
 * `costs`. This will find the least-costly path from an initial state to a
 * state for which `found` returns `true`. Returns `null` if no path to a
 * solved state is possible.
 *
 * @public
 * @param getNextStates - Function to generate list of neighboring states given the current state
 * @param getCost - Function to generate transition costs between neighboring states
 * @param determineIfFound - Predicate to determine if solution found. 'dijkstra' returns the shortest path to the first state for which this predicate returns `true`
 * @param initial
 * @returns
 */
export const dijkstra = <T>(
  getNextStates: (state: T) => T[],
  getCost: (from: T, to: T) => number,
  determineIfFound: (state: T) => boolean,
  initial: T,
): [number, T[], T[]] | undefined => {
  const nextAssoc = (state: T) => getNextStates(state).map(n => [n, getCost(state, n)] as [T, number]);
  return dijkstraAssoc(nextAssoc, determineIfFound, initial);
};
