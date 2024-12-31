import { HashSet } from '../structures/hashSet';

/**
 * Dynamically generates and walks a tree in depth-first order
 * This tree produces all possible pathways, and will revisit nodes, but not among its own unique pathway
 *
 * @category DepthFirst
 * @param getNextStates - a function to generate list of neighboring states given the current state
 * @param forest - top level "forest" of states to begin traversal from
 */
export const generateDepthFirstTreeTraversal = function* <T>(
  getNextStates: (a: T) => T[],
  forest: T[],
): Generator<{ path: T[]; state: T }> {
  // we stack a pair of values and the path through to get there
  const stack: [T, T[]][] = forest.map<[T, T[]]>(f => [f, []]).reverse();

  while (stack.length) {
    const [state, pathSoFar] = stack.pop()!;
    const path = [...pathSoFar, state];
    yield { path, state };

    stack.push(
      ...getNextStates(state)
        .map<[T, T[]]>(v => [v, path])
        .reverse(),
    );
  }
};

/**
 * Generator function that lazily iterates through each visit of a depth-first search.
 * If you want just the found path to the solution, use `depthFirstSearch`
 *
 * Each yield is an object `{ path: T[]; state: T }`
 * * `state` is the current state being visited
 * * `path` is, including current state, the in order steps it took to get to that state
 * * states are never re-visited
 *
 * @category DepthFirst
 * @param getNextStates - a function to generate list of neighboring states given the current state
 * @param initial - initial state
 */
export const generateDepthFirstSearch = function* <T>(
  getNextStates: (state: T) => T[],
  initial: T,
): Generator<{ path: T[]; state: T }> {
  const visited = new HashSet<T>();
  // we stack a pair of values and the path through to get there
  const stack: [T, T[]][] = [[initial, []]];

  while (stack.length) {
    const [state, pathSoFar] = stack.pop()!;
    if (visited.has(state)) continue;
    const path = [...pathSoFar, state];
    yield { path, state };

    visited.add(state);

    stack.push(
      ...getNextStates(state)
        .filter(v => !visited.has(v))
        .map<[T, T[]]>(v => [v, path])
        .reverse(),
    );
  }
};

/**
 * Performs a depth-first-search (dfs) over a set of states starting from an `initial`
 * Returns a `{ path: T[]; state: T }` when solution found, `undefined` otherwise
 *
 * @category DepthFirst
 * @param getNextStates - a function to generate list of neighboring states given the current state
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 */
export const depthFirstSearch = <T>(
  getNextStates: (state: T) => T[],
  determineIfFound: (state: T) => boolean,
  initial: T,
): { path: T[]; state: T } | undefined => {
  for (const visit of generateDepthFirstSearch(getNextStates, initial)) {
    if (determineIfFound(visit.state)) return visit;
  }
  return undefined;
};
