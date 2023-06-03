import { generalizedSearch } from './generalizedSearch';
import { leastCostly } from './leastCostly';
import { fst, isNil, last, snd } from './utils';

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
    return [fst(last(packedStates)!), packedStates.map(x => x[1])];
  };

  const nextSt = ([oldCost, st]: [number, TState]) =>
    next(st).map<[number, TState]>(([newSt, newCost]) => [newCost + oldCost, newSt]);

  const r = generalizedSearch<[number, TState], TState>(snd, leastCostly, nextSt, state => found(snd(state)), [
    0,
    initial
  ]);
  return unpack(r);
};

/**
 * Performs a shortest-path search over
 * a set of states using Dijkstra's algorithm, starting with `initial`,
 * generating neighboring states with `next`, and their incremental costs with
 * `costs`. This will find the least-costly path from an initial state to a
 * state for which `found` returns `true`. Returns `undefined` if no path to a
 * solved state is possible.
 *
 * @param next - Function to generate list of neighboring states given the current state
 * @param cost - Function to generate transition costs between neighboring states. This is only called for adjacent states, so it is safe to have this function be partial for non-neighboring states.
 * @param found - Predicate to determine if solution found. 'dijkstra' returns the shortest path to the first state for which this predicate returns `true`
 * @param initial
 * @returns
 */
export const dijkstra = <TState>(
  next: (state: TState) => TState[],
  cost: (stA: TState, stB: TState) => number,
  found: (state: TState) => boolean,
  initial: TState
): [number, TState[]] | undefined => {
  // create assocNext out of `next` and `cost`
  const nextAssoc = (st: TState) => next(st).map<[TState, number]>(newSt => [newSt, cost(st, newSt)]);
  return dijkstraAssoc(nextAssoc, found, initial);
};
