import { HashSet } from '../structures/hashSet';

/**
 * Dynamically generates and walks a tree in breadth-first order
 * This tree produces all possible pathways, and will revisit nodes, but not among its own unique pathway
 *
 * @public
 * @category BreadthFirst
 * @param getNextStates - a function to generate list of neighboring states given the current state
 * @param forest - top level "forest" of states to begin traversal from
 */
export const generateBreadthFirstTreeTraversal = function* <T>(
  getNextStates: (state: T) => T[],
  forest: T[],
): Generator<{ path: T[]; state: T }> {
  // we queue a pair of values and the path through to get there
  const queue: [T, T[]][] = forest.map<[T, T[]]>(f => [f, []]);

  while (queue.length) {
    const [state, pathSoFar] = queue.shift()!;
    const path = [...pathSoFar, state];
    yield { path, state };

    queue.push(...getNextStates(state).map<[T, T[]]>(s => [s, path]));
  }
};

/**
 * Generator function that lazily iterates through each visit of a breadth-first search.
 * If you want just the found path to the solution, use `breadthFirstSearch`
 *
 * Each yield is an object `{ path: T[]; state: T }`
 * * `state` is the current state being visited
 * * `path` is, including current state, the in order steps it took to get to that state
 * * states are never re-visited
 *
 * @public
 * @category BreadthFirst
 * @param getNextStates - a function to generate list of neighboring states given the current state
 * @param initial - initial state
 */
export const generateBreadthFirstSearch = function* <T>(
  getNextStates: (state: T) => T[],
  initial: T,
): Generator<{ path: T[]; state: T }> {
  const visited = new HashSet<T>();
  // we queue a pair of values and the path through to get there
  const queue: [T, T[]][] = [[initial, []]];

  while (queue.length) {
    const [state, pathSoFar] = queue.shift()!;

    if (visited.has(state)) continue;

    const path = [...pathSoFar, state];
    yield { path, state };

    visited.add(state);

    queue.push(
      ...getNextStates(state)
        .filter(v => !visited.has(v))
        .map<[T, T[]]>(v => [v, path]),
    );
  }
};

/**
 * Performs a breadth-first-search (bfs) over a set of states starting from an `initial`
 * Returns a `{ path: T[]; state: T }` when solution found, `undefined` otherwise
 *
 * @public
 * @category BreadthFirst
 * @param getNextStates - a function to generate list of neighboring states given the current state
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 */
export const breadthFirstSearch = <T>(
  getNextStates: (state: T) => T[],
  determineIfFound: (state: T) => boolean,
  initial: T,
): { path: T[]; state: T } | undefined => {
  for (const visit of generateBreadthFirstSearch(getNextStates, initial)) {
    if (determineIfFound(visit.state)) return visit;
  }
  return undefined;
};
