import { tail, zipWith } from 'ramda';

/**
 * Utility function to be used with 'dijkstra'-like functions.
 * It returns `true` when the cost of `pathsA` less than the cost of `pathsB`,
 * where the total costs are the first elements in each tuple in each path
 *
 * @private
 * @param pathsA
 * @param pathsB
 * @returns {boolean}
 */
export const leastCostly = <A, B>(pathsA: [A, B][], pathsB: [A, B][]): boolean => {
  if (!pathsB.length) return true;
  if (!pathsA.length) return false;
  return pathsB[0][0] < pathsA[0][0];
};

/**
 * Gives a list of the incremental costs
 * going from state to state along the path given in `states`, using the cost
 * function given by `cost` function. Note that the paths returned by the searches
 * in this module do not include the initial state, so if you want the
 * incremental costs along a `path` returned by one of these searches, you
 * want to use `incrementalCosts(cost_fn, [initial, ...path])`
 *
 * @public
 * @param cost - Function to generate list of costs between neighboring states
 * @param states - A path, given as a list of adjacent states, along which to find the incremental costs
 * @returns List of incremental costs along given path
 */
export const incrementalCost = <T>(cost: (a: T, b: T) => number, states: T[]): number[] =>
  zipWith(cost, states, tail(states));

/**
 * Predicate@ streams the elements generate by `next` into a
 * list, removing elements which satisfy `predicate`. This is useful for the
 * common case when you want to logically separate your search's `next` function
 * from some way of determining when you've reached a dead end.
 *
 * @public
 * @param next - Function to generate next states
 * @param predicate - Predicate to prune on
 * @returns Version of `next` which excludes elements satisfying `predicate`
 */
export const pruning =
  <T>(next: (a: T) => T[], predicate: (a: T) => boolean) =>
  (a: T) =>
    next(a).filter(x => !predicate(x));
