import { generalizedSearch } from './generalizedSearch';
import { leastCostly } from './leastCostly';
import { fst, isNil, last, snd } from './utils';

/**
 * Performs a best-first search
 * using the A* search algorithm, starting with the state @initial@, generating
 * neighboring states and their associated costs with @next@, and an estimate of
 * the remaining cost with @remaining@. This returns a path to a state for which
 * @found@ returns 'True'. If @remaining@ is strictly a lower bound on the
 * remaining cost to reach a solved state, then the returned path is the
 * shortest path. Returns 'Nothing' if no path to a solved state is possible.
 *
 * @param next - Function to generate list of neighboring states with associated transition costs given the current state
 * @param remaining - Estimate on remaining cost given a state
 * @param found - Predicate to determine if solution found. `aStar` returns the shortest path to the first state for which this predicate returns `true`
 * @param initial - Initial state
 * @returns [Total cost, list of steps] for the first path found which satisfies the given predicate
 */
export const aStarAssoc = <TState>(
  next: (state: TState) => [TState, number][],
  remaining: (state: TState) => number,
  found: (state: TState) => boolean,
  initial: TState
): [number, TState[]] | undefined => {
  const nextAssoc = ([_, [oldCost, oldSt]]: [number, [number, TState]]) =>
    next(oldSt).map<[number, [number, TState]]>(([newSt, cost]: [TState, number]) => {
      const newCost = oldCost + cost;
      const newEst = newCost + remaining(newSt);
      return [newEst, [newCost, newSt]];
    });

  const unpack = (packedStates: [number, [number, TState]][] | undefined): [number, TState[]] | undefined => {
    if (isNil(packedStates)) return packedStates;
    if (!packedStates.length) return [0, []];
    // (fst . snd . last $ packed_states, map snd2 packed_states)
    return [fst(snd(last(packedStates)!)), packedStates.map(x => snd(snd(x)))];
  };

  const r = generalizedSearch<[number, [number, TState]], TState>(
    x => snd(snd(x)),
    leastCostly,
    nextAssoc,
    x => found(snd(snd(x))),
    [remaining(initial), [0, initial]]
  );

  return unpack(r);
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
 * @param next - Function to generate list of neighboring states given the current state
 * @param cost - Function to generate transition costs between neighboring states
 * @param remaining - Estimate on remaining cost given a state
 * @param found - Predicate to determine if solution found. `aStar` returns the shortest path to the first state for which this predicate returns `true`
 * @param initial - Initial state
 * @returns - [Total cost, list of steps] for the first path found which satisfies the given predicate
 */
export const aStar = <TState>(
  next: (state: TState) => TState[],
  cost: (stA: TState, stB: TState) => number,
  remaining: (state: TState) => number,
  found: (state: TState) => boolean,
  initial: TState
): [number, TState[]] | undefined => {
  // create assocNext out of `next` and `cost`
  const nextAssoc = (st: TState) => next(st).map<[TState, number]>(newSt => [newSt, cost(st, newSt)]);
  return aStarAssoc(nextAssoc, remaining, found, initial);
};
