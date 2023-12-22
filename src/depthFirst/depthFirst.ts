import { last } from 'ramda';

/**
 * Generate an iterable via a Depth-First-Search
 *
 * The goal of this generator function is not to "find" a specific node,
 * but rather just iterate over some data depth-first
 * If your data is infinite, the generator will hang
 *
 * @param next
 * @param initial
 */
export function* generateDfs<T>(next: (a: T) => T[], initial: T): Generator<T> {
  const stack = [initial];

  while (stack.length) {
    const value = stack.pop()!;
    yield value;
    stack.push(...next(value).reverse());
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
export const dfs = <T>(next: (a: T) => T[], found: (a: T) => boolean, initial: T) => {
  const dive = (accumPath: T[]): T[] | undefined => {
    const value = last(accumPath)!;

    if (found(value)) return accumPath;

    const ns = next(value);
    while (ns.length) {
      const n = ns.shift()!;
      const maybeFound = dive([...accumPath, n]);
      if (maybeFound) return maybeFound;
    }

    return undefined;
  };

  return dive([initial]);
};
