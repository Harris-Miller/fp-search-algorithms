import { toString } from 'ramda';

import { generalizedSearch } from './generalizedSearch';

/**
 * Performs a breadth-first search over a set of
 * states, starting with @initial@, and generating neighboring states with
 * @next@. It returns a path to a state for which @found@ returns 'True'.
 * Returns 'Nothing' if no path is possible.
 *
 * @public
 * @param next - Function to generate "next" states given a current state
 * @param found - Predicate to determine if solution found. `bfs` returns a path to the first state for which this predicate returns `true`.
 * @param initial  Initial state
 * @returns First path found to a state matching the predicate, or `null` if no such path exists.
 */
export const bfs = <T>(next: (state: T) => T[], found: (state: T) => boolean, initial: T): T[] | undefined =>
  generalizedSearch([], toString, () => false, next, found, initial);
