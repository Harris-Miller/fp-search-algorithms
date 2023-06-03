import { tail, zipWith } from './fp';

export const incrementalCost = <T>(cost: (a: T, b: T) => number, states: T[]): number[] =>
  zipWith(cost, states, tail(states));

export const pruning =
  <T>(next: (a: T) => T[], predicate: (a: T) => boolean) =>
  (a: T) =>
    next(a).filter(x => !predicate(x));
