import { isNil, last } from 'ramda';

import { fst, leastCostly, lifoHeap, snd } from '../common';
import { generalizedSearch } from '../generalizedSearch';

const unpack = <T>(packedStates: [number, [number, T]][] | undefined): [number, T[]] | undefined => {
  if (isNil(packedStates)) return undefined;
  if (!packedStates.length) return [0, []];
  // (fst . snd . last $ packed_states, map snd2 packed_states)
  return [fst(snd(last(packedStates)!)), packedStates.map(x => snd(snd(x)))];
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
 * @param next - Function to generate list of neighboring states with associated transition costs given the current state
 * @param remaining - Estimate on remaining cost given a state
 * @param found - Predicate to determine if solution found. `aStar` returns the shortest path to the first state for which this predicate returns `true`
 * @param initial - Initial state
 * @returns [Total cost, list of steps] for the first path found which satisfies the given predicate
 */
export const aStarAssoc = <T>(
  next: (state: T) => [T, number][],
  remaining: (state: T) => number,
  found: (state: T) => boolean,
  initial: T
): [number, T[]] | undefined => {
  const nextAssoc = ([_, [oldCost, oldSt]]: [number, [number, T]]) =>
    next(oldSt).map<[number, [number, T]]>(([newSt, cost]: [T, number]) => {
      const newCost = oldCost + cost;
      const newEst = newCost + remaining(newSt);
      return [newEst, [newCost, newSt]];
    });

  const start = [remaining(initial), [0, initial]] as [number, [number, T]];
  const result = generalizedSearch(lifoHeap<[number, T]>(), leastCostly, nextAssoc, x => found(snd(snd(x))), start);
  return unpack(result);
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
  next: (state: T) => T[],
  cost: (stA: T, stB: T) => number,
  remaining: (state: T) => number,
  found: (state: T) => boolean,
  initial: T
): [number, T[]] | undefined => {
  // create assocNext out of `next` and `cost`
  const nextAssoc = (st: T) => next(st).map<[T, number]>(newSt => [newSt, cost(st, newSt)]);
  return aStarAssoc(nextAssoc, remaining, found, initial);
};
