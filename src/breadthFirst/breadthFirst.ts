import { toString } from 'ramda';

/**
 * Performs a breadth-first traversal over a set of states.
 * Starting with `initial`, and generating neighboring states with `next`.
 * This generator yields each state as it is visited.
 * Caution: If your states grow infinitely, so will this generator
 *
 * @param next
 * @param start
 */
export function* breadthFirstTraversal<T>(next: (a: T) => T[], start: T): Generator<[T, T[]]> {
  const visited = new Set<string>();
  // we queue a pair of values and the path through to get there
  const queue: [T, T[]][] = [[start, []]];

  while (queue.length) {
    const [value, pathSoFar] = queue.shift()!;

    const asStr = toString(value);
    if (visited.has(asStr)) continue;

    yield [value, [...pathSoFar, value]];

    visited.add(asStr);

    const nextPathSoFar = [...pathSoFar, value];
    queue.push(
      ...next(value)
        .filter(v => !visited.has(toString(v)))
        .map(v => [v, nextPathSoFar] as [T, T[]]),
    );
  }
}

/**
 * Performs a breadth-first-search (bfs) over a set of states.
 * Starting with `initial`, and generating neighboring states with `next`
 * Returns a path to a state when `found` returns `true`
 * Returns `undefined` if no path is possible.
 *
 * @public
 * @param next - Function to generate "next" states given a current state
 * @param found - Predicate to determine if solution found. `bfs` returns a path to the first state for which this predicate returns `true`.
 * @param start - Initial state
 * @returns First path found to a state matching the predicate, or `null` if no such path exists.
 */
export const breadthFirstSearch = <T>(
  next: (state: T) => T[],
  found: (state: T) => boolean,
  start: T,
): [T, T[], T[]] | undefined => {
  const visited: T[] = [];
  for (const [value, pathTo] of breadthFirstTraversal(next, start)) {
    visited.push(value);
    if (found(value)) return [value, pathTo, visited];
  }
  return undefined;
};
