import { createPath } from '../src/searches/internal/createPath';
import { HashMap } from '../src/structures/hashMap';
import { PriorityQueue } from '../src/structures/priorityQueue';

// This file is the previous stand-alone implementation of Dijkstra before I made it use AStar with a heuristic `() => 0`

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
 * @public
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
  const cameFrom = new HashMap<T, T>();
  const costMap = new HashMap<T, number>().set(initial, 0);

  const queue = new PriorityQueue<T>((a, b) => {
    const aScore = costMap.get(a)!;
    const bScore = costMap.get(b)!;
    return aScore < bScore;
  });
  queue.push(initial);

  while (!queue.isEmpty()) {
    const state = queue.pop()!;

    const toYield: { cost: number; path: T[] } = {
      cost: costMap.get(state)!,
      path: createPath(cameFrom, state),
    };
    yield toYield;
    if (determineIfFound(state)) return toYield;

    const visitCost = costMap.get(state) ?? Infinity;
    const nextStates = getNextStates(state);
    for (const [nextState, nextCost] of nextStates) {
      const altCost = visitCost + nextCost;
      if (altCost < (costMap.get(nextState) ?? Infinity)) {
        costMap.set(nextState, altCost);
        cameFrom.set(nextState, state);
        queue.push(nextState);
      }
    }
  }

  return undefined;
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
 * @public
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
  const nextAssoc = (state: T) => getNextStates(state).map(n => [n, getCost(state, n)] as [T, number]);
  return yield* generateDijkstraAssoc(nextAssoc, determineIfFound, initial);
};

/**
 * Performs a best-first search using the Dijkstra search algorithm
 *
 * @public
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
 * @public
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
