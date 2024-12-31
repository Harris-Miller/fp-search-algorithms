import { generateAStar, generateAStarAssoc } from './aStar';

/**
 * Generator function that lazily iterates through each visit of an Dijkstra search.
 * If you want just the found path and totalCost to the solution, use `dijkstra`
 *
 * Each yield is an object `{ cost: number; path: T[] }`
 *
 * Notes:
 * * The first yield will be the initialState with a cost of 0
 * * Specific states may be visited multiple time, but through different costs and paths
 * * If the solved state is found, that will be the final yield, otherwise the final yield will happen once all possible states are visited
 * * The return value is the total cost and path, or undefined if path to solved state is not possible
 *
 * @category Dijkstra
 * @param getNextStates - a function to generate list of neighboring states with associated transition costs given the current state
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 */
export const generateDijkstraAssoc = function* <T>(
  getNextStates: (state: T) => [state: T, cost: number][],
  determineIfFound: (state: T) => boolean,
  initial: T,
): Generator<{ cost: number; path: T[] }, { cost: number; path: T[] } | undefined> {
  return yield* generateAStarAssoc(getNextStates, () => 0, determineIfFound, initial);
};

/**
 * Generator function that lazily iterates through each visit of an Dijkstra search.
 * If you want just the found path and totalCost to the solution, use `dijkstra`
 *
 * Each yield is an object `{ cost: number; path: T[] }`
 *
 * Notes:
 * * The first yield will be the initialState with a cost of 0
 * * Specific states may be visited multiple time, but through different costs and paths
 * * If the solved state is found, that will be the final yield, otherwise the final yield will happen once all possible states are visited
 * * The return value is the total cost and path, or undefined if path to solved state is not possible
 *
 * @category Dijkstra
 * @param getNextStates - a function to generate list of neighboring states given the current state
 * @param getCost - a function to generate transition costs between neighboring states
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 */
export const generateDijkstra = function* <T>(
  getNextStates: (state: T) => T[],
  getCost: (from: T, to: T) => number,
  determineIfFound: (state: T) => boolean,
  initial: T,
): Generator<{ cost: number; path: T[] }, { cost: number; path: T[] } | undefined> {
  return yield* generateAStar(getNextStates, getCost, () => 0, determineIfFound, initial);
};

/**
 * Performs a best-first search using the Dijkstra search algorithm
 *
 * @category Dijkstra
 * @param getNextStates - a function to generate list of neighboring states and costs given the current state
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 * @returns an object with `totalCost` and the `path` with costs between states, or `undefined` if no path found
 */
export const dijkstraAssoc = <T>(
  getNextStates: (state: T) => [state: T, cost: number][],
  determineIfFound: (state: T) => boolean,
  initial: T,
): { cost: number; path: T[] } | undefined => {
  const iterable = generateDijkstraAssoc(getNextStates, determineIfFound, initial);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = iterable.next();
    if (done === true) return value;
  }
};

/**
 * Performs a best-first search using the Dijkstra search algorithm
 *
 * @category Dijkstra
 * @param getNextStates - a function to generate list of neighboring states with associated transition costs given the current state
 * @param getCost - a function to generate transition costs between neighboring states
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 * @returns an object with `totalCost` and the `path` with costs between states, or `undefined` if no path found
 */
export const dijkstra = <T>(
  getNextStates: (state: T) => T[],
  getCost: (from: T, to: T) => number,
  determineIfFound: (state: T) => boolean,
  initial: T,
): { cost: number; path: T[] } | undefined => {
  const iterable = generateDijkstra(getNextStates, getCost, determineIfFound, initial);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = iterable.next();
    if (done === true) return value;
  }
};
