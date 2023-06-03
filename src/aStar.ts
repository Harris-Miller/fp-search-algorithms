import { generalizedSearch } from './generalizedSearch';
import { leastCostly } from './leastCostly';
import { fst, isNil, last, snd } from './utils';

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

// aStar next cost remaining found initial =
//   -- This API to A* search is useful when the state transition
//   -- function and the cost function are logically separate.
//   -- It is implemented by using @aStarAssoc@ with appropriate mapping of
//   -- arguments.
//   aStarAssoc next' remaining found initial
//   where
//     next' st = map (\new_st -> (new_st, cost st new_st)) $
//                Foldable.toList (next st)
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
