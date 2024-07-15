import { toString } from 'ramda';

/**
 * Performs a depth-first traversal over a set of states.
 * Starting with `initial`, and generating neighboring states with `next`.
 * This generator yields each state as it is visited.
 * Caution: If your states grow infinitely, so will this generator
 *
 * @param next
 * @param initial
 */
export function* depthFirstTraversal<T>(next: (a: T) => T[], start: T): Generator<[T, T[]]> {
  const visited = new Set<string>();
  // we stack a pair of values and the path through to get there
  const stack: [T, T[]][] = [[start, []]];

  while (stack.length) {
    const [value, pathSoFar] = stack.pop()!;

    const asStr = toString(value);
    if (visited.has(asStr)) continue;

    yield [value, [...pathSoFar, value]];

    visited.add(asStr);

    const nextPathSoFar = [...pathSoFar, value];
    stack.push(
      ...next(value)
        .filter(v => !visited.has(toString(v)))
        .map(v => [v, nextPathSoFar] as [T, T[]])
        .reverse(),
    );
  }
}

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
export const depthFirstSearch = <T>(
  next: (state: T) => T[],
  found: (state: T) => boolean,
  start: T,
): [T, T[], T[]] | undefined => {
  const visited: T[] = [];
  for (const [value, pathTo] of depthFirstTraversal(next, start)) {
    visited.push(value);
    if (found(value)) return [value, pathTo, visited];
  }
  return undefined;
};
