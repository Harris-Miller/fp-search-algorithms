import { HashSet } from '../structures/hashSet';

/**
 * Dynamically generates and walks a tree in breadth-first order
 * This tree produces all possible pathways, and will revisit nodes
 * If a node is reach more than once, pathSoFar will be unique between them
 *
 * @public
 * @category BreadthFirst
 */
export const generateTreeBreadthFirst = function* <T>(
  next: (a: T) => T[],
  start: T,
): Generator<[visit: T, pathFromStart: T[]]> {
  // we queue a pair of values and the path through to get there
  const queue: [T, T[]][] = [[start, []]];

  while (queue.length) {
    const [value, pathSoFar] = queue.shift()!;

    yield [value, [...pathSoFar, value]];

    const nextPathSoFar = [...pathSoFar, value];
    queue.push(...next(value).map(v => [v, nextPathSoFar] as [T, T[]]));
  }
};

/**
 * Performs a breadth-first traversal over a set of states.
 * Starting with `initial`, and generating neighboring states with `next`.
 * This generator yields each state as it is visited.
 * Caution: If your states grow infinitely, so will this generator
 *
 * @public
 * @category BreadthFirst
 */
export const generateBreadthFirstSearch = function* <T>(
  next: (a: T) => T[],
  start: T,
): Generator<[visit: T, pathFromStart: T[]]> {
  const visited = new HashSet<T>();
  // we queue a pair of values and the path through to get there
  const queue: [T, T[]][] = [[start, []]];

  while (queue.length) {
    const [value, pathSoFar] = queue.shift()!;

    if (visited.has(value)) continue;

    yield [value, [...pathSoFar, value]];

    visited.add(value);

    const nextPathSoFar = [...pathSoFar, value];
    queue.push(
      ...next(value)
        .filter(v => !visited.has(v))
        .map(v => [v, nextPathSoFar] as [T, T[]]),
    );
  }
};

/**
 * Performs a breadth-first traversal over a set of states.
 * Starting with `initial`, and generating neighboring states with `next`.
 * This generator yields each state as it is visited.
 * Caution: If your states grow infinitely, so will this generator
 *
 * @public
 * @category BreadthFirst
 * @deprecated renamed `generateBreadthFirstSearch
 */
export const breadthFirstTraversal = generateBreadthFirstSearch;

/**
 * Performs a breadth-first-search (bfs) over a set of states.
 * Starting with `initial`, and generating neighboring states with `next`
 * Returns a path to a state when `found` returns `true`
 * Returns `undefined` if no path is possible.
 *
 * @public
 * @category BreadthFirst
 * @param next - Function to generate "next" states given a current state
 * @param found - Predicate to determine if solution found. `bfs` returns a path to the first state for which this predicate returns `true`.
 * @param start - Initial state
 * @returns First path found to a state matching the predicate, `undefined` if no such path exists.
 */
export const breadthFirstSearch = <T>(
  next: (state: T) => T[],
  found: (state: T) => boolean,
  start: T,
): [foundState: T, pathTo: T[], visited: T[]] | undefined => {
  const visited: T[] = [];
  for (const [value, pathTo] of generateBreadthFirstSearch(next, start)) {
    visited.push(value);
    if (found(value)) return [value, pathTo, visited];
  }
  return undefined;
};
