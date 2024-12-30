import { HashSet } from '../structures/hashSet';

/**
 * Dynamically generates and walks a tree in breadth-first order
 * This tree produces all possible pathways, and will revisit nodes
 * If a node is reach more than once, pathSoFar will be unique between them
 *
 * @public
 * @category DepthFirst
 */
export const generateTreeDepthFirst = function* <T>(
  next: (a: T) => T[],
  start: T,
): Generator<[visit: T, pathFromStart: T[]]> {
  // we stack a pair of values and the path through to get there
  const stack: [T, T[]][] = [[start, []]];

  while (stack.length) {
    const [value, pathSoFar] = stack.pop()!;

    yield [value, [...pathSoFar, value]];

    const nextPathSoFar = [...pathSoFar, value];
    stack.push(
      ...next(value)
        .map(v => [v, nextPathSoFar] as [T, T[]])
        .reverse(),
    );
  }
};

/**
 * Performs a depth-first traversal over a set of states.
 * Starting with `initial`, and generating neighboring states with `next`.
 * This generator yields each state as it is visited.
 * Caution: If your states grow infinitely, so will this generator
 *
 * @public
 * @category DepthFirst
 * @param next
 * @param initial
 */
export const depthFirstTraversal = function* <T>(next: (a: T) => T[], start: T): Generator<[T, T[]]> {
  const visited = new HashSet<T>();
  // we stack a pair of values and the path through to get there
  const stack: [T, T[]][] = [[start, []]];

  while (stack.length) {
    const [value, pathSoFar] = stack.pop()!;

    if (visited.has(value)) continue;

    yield [value, [...pathSoFar, value]];

    visited.add(value);

    const nextPathSoFar = [...pathSoFar, value];
    stack.push(
      ...next(value)
        .filter(v => !visited.has(v))
        .map(v => [v, nextPathSoFar] as [T, T[]])
        .reverse(),
    );
  }
};

/**
 * Performs a depth-first search over a set
 * of states, starting with @initial@ and generating neighboring states with
 * @next@. It returns a depth-first path to a state for which @found@ returns
 * 'True'. Returns 'Nothing' if no path is possible.
 *
 * @public
 * @category DepthFirst
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
