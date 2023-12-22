import { isNil, last, toString } from 'ramda';

import { fst, leastCostly, lifoHeap, snd } from '../common';
import { generalizedSearch } from '../generalizedSearch_old';
import { priorityQueue } from '../utils/priorityQueue';

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
    return [fst(last(packedStates)!), packedStates.map(snd)];
  };

  const nextSt = ([oldCost, st]: [number, TState]) =>
    next(st).map<[number, TState]>(([newSt, newCost]) => [newCost + oldCost, newSt]);

  const r = generalizedSearch(
    lifoHeap<TState>(),
    state => toString(snd(state)),
    leastCostly,
    nextSt,
    state => found(snd(state)),
    [0, initial]
  );
  return unpack(r);
};

/**
 *
 * @param prevMap
 * @param final
 * @returns
 */
const createPath = <T>(prevMap: Map<T, T>, final: T) => {
  const path: T[] = [final];
  let prev = prevMap.get(final);
  while (prev) {
    path.push(prev);
    prev = prevMap.get(prev);
  }
  return path.reverse();
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
 * @param next - Function to generate list of neighboring states given the current state
 * @param cost - Function to generate transition costs between neighboring states
 * @param found - Predicate to determine if solution found. 'dijkstra' returns the shortest path to the first state for which this predicate returns `true`
 * @param initial
 * @returns
 */
export const dijkstra = <T>(
  next: (state: T) => T[],
  cost: (from: T, to: T) => number,
  found: (state: T) => boolean,
  initial: T
): [number, T[]] | undefined => {
  const prevMap = new Map<T, T>();
  const costMap = new Map<T, number>([[initial, 0]]);

  const visited = new Set<T>();

  const queue = priorityQueue<T>((a: T, b: T) => {
    const aCost = costMap.get(a) ?? Infinity;
    const bCost = costMap.get(b) ?? Infinity;
    return aCost < bCost;
  });

  queue.push(initial);

  while (!queue.isEmpty()) {
    const v = queue.pop()!;

    if (found(v)) {
      const path = createPath(prevMap, v);
      const totalCost = costMap.get(v)!;
      return [totalCost, path];
    }

    visited.add(v);

    const vCost = costMap.get(v) ?? Infinity;

    const ns = next(v);
    for (const n of ns) {
      const nCost = cost(v, n);
      const alt = vCost + nCost;
      if (alt < (costMap.get(n) ?? Infinity)) {
        costMap.set(n, alt);
        prevMap.set(n, v);
        queue.push(n);
      }
    }
  }

  return undefined;
};
