import { identity } from './fp';
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
 * @returns First path found to a state matching the predicate, or `undefined` if no such path exists.
 */
export const bfs = <TState>(
  next: (state: TState) => TState[],
  found: (state: TState) => boolean,
  initial: TState
): TState[] | undefined => generalizedSearch(identity, () => false, next, found, initial);

/**
 * Performs a depth-first search over a set
 * of states, starting with @initial@ and generating neighboring states with
 * @next@. It returns a depth-first path to a state for which @found@ returns
 * 'True'. Returns 'Nothing' if no path is possible.
 *
 * @public
 * @param next - Function to generate "next" states given a current state. These should be given in the order in which states should be pushed onto the stack, i.e. the "last" state in the Foldable will be the first one visited.
 * @param found - Predicate to determine if solution found. `dfs` returns a path to the first state for which this predicate returns `true`.
 * @param initial - Initial state
 * @returns First path found to a state matching the predicate, or `undefined` if no such path exists.
 */
export const dfs = <TState>(
  next: (state: TState) => TState[],
  found: (state: TState) => boolean,
  initial: TState
): TState[] | undefined => generalizedSearch(identity, () => true, next, found, initial);
