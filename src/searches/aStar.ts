import { HashMap } from '../structures/hashMap';
import { PriorityQueue } from '../structures/priorityQueue';

import { createPath } from './internal/createPath';

/**
 * Generator function that lazily iterates through each visit of an A* search.
 * If you want just the found path and totalCost to the solution, use `aStarAssoc`
 *
 * Each yield is an object `{ cost: number; path: T[] }`
 *
 * Notes:
 * * The first yield will be the initialState with a cost of 0
 * * Specific states may be visited multiple time, but through different costs and paths
 * * If the solved state is found, that will be the final yield, otherwise the final yield will happen once all possible states are visited
 * * Generator `return` value (at `done: true`) will be the found solution or undefined
 *
 * @category AStar
 * @param getNextStates - a function to generate list of neighboring states with associated transition costs given the current state
 * @param estimateRemainingCost - a heuristic function to determine remaining cost
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 */
export const generateAStarAssoc = function* <T>(
  getNextStates: (state: T) => [state: T, cost: number][],
  estimateRemainingCost: (state: T) => number,
  determineIfFound: (state: T) => boolean,
  initial: T,
): Generator<{ cost: number; path: T[] }, { cost: number; path: T[] } | undefined> {
  const cameFrom = new HashMap<T, T>();
  const gScore = new HashMap<T, number>().set(initial, 0);
  const fScore = new HashMap<T, number>().set(initial, estimateRemainingCost(initial));

  const queue = new PriorityQueue<T>((a, b) => {
    const aScore = fScore.get(a)!;
    const bScore = fScore.get(b)!;
    return aScore < bScore;
  });
  queue.push(initial);

  while (!queue.isEmpty()) {
    const state = queue.pop()!;

    const cost = gScore.get(state)!;
    const toYield: { cost: number; path: T[] } = {
      cost,
      path: createPath(cameFrom, state),
    };
    yield toYield;
    if (determineIfFound(state)) return toYield;

    const nextStates = getNextStates(state);
    for (const [nextState, nextCost] of nextStates) {
      const tentativeGScore = cost + nextCost;

      if (tentativeGScore < (gScore.get(nextState) ?? Infinity)) {
        cameFrom.set(nextState, state);
        gScore.set(nextState, tentativeGScore);
        fScore.set(nextState, tentativeGScore + estimateRemainingCost(nextState));
        queue.push(nextState);
      }
    }
  }

  return undefined;
};

/**
 * Generator function that lazily iterates through each visit of an A* search.
 * If you want just the found path and totalCost to the solution, use `aStar`
 *
 * Each yield is an object `{ cast: number; path: T[] }`
 *
 * Notes:
 * * The first yield will be the initialState with a cost of 0
 * * Specific states may be visited multiple time, but through different costs and paths
 * * If the solved state is found, that will be the final yield, otherwise the final yield will happen once all possible states are visited
 * * The return value is the total cost and path, or undefined if path to solved state is not possible
 *
 * @category AStar
 * @param getNextStates - a function to generate list of neighboring states given the current state
 * @param getCost - a function to generate transition costs between neighboring states
 * @param estimateRemainingCost - a heuristic function to determine remaining cost
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 */
export const generateAStar = function* <T>(
  getNextStates: (state: T) => T[],
  getCost: (from: T, to: T) => number,
  estimateRemainingCost: (state: T) => number,
  determineIfFound: (state: T) => boolean,
  initial: T,
): Generator<{ cost: number; path: T[] }, { cost: number; path: T[] } | undefined> {
  const nextAssoc = (state: T) => getNextStates(state).map<[T, number]>(n => [n, getCost(state, n)]);
  return yield* generateAStarAssoc(nextAssoc, estimateRemainingCost, determineIfFound, initial);
};

/**
 * Performs a best-first search using the A* search algorithm
 *
 * @category AStar
 * @param getNextStates - a function to generate list of neighboring states with associated transition costs given the current state
 * @param estimateRemainingCost - a heuristic function to determine remaining cost
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 * @returns an object with `totalCost` and the `path` with costs between states, or `undefined` if no path found
 */
export const aStarAssoc = <T>(
  getNextStates: (state: T) => [state: T, cost: number][],
  estimateRemainingCost: (state: T) => number,
  determineIfFound: (state: T) => boolean,
  initial: T,
): { cost: number; path: T[] } | undefined => {
  const iterable = generateAStarAssoc(getNextStates, estimateRemainingCost, determineIfFound, initial);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = iterable.next();
    if (done === true) return value;
  }
};

/**
 * Performs a best-first search using the A* search algorithm
 *
 * @category AStar
 * @param getNextStates - a function to generate list of neighboring states given the current state
 * @param getCost - a function to generate transition costs between neighboring states
 * @param estimateRemainingCost - a heuristic function to determine remaining cost
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 * @returns an object with `totalCost` and the `path` with costs between states, or `undefined` if no path found
 */
export const aStar = <T>(
  getNextStates: (state: T) => T[],
  getCost: (from: T, to: T) => number,
  estimateRemainingCost: (state: T) => number,
  determineIfFound: (state: T) => boolean,
  initial: T,
): { cost: number; path: T[] } | undefined => {
  const iterable = generateAStar(getNextStates, getCost, estimateRemainingCost, determineIfFound, initial);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = iterable.next();
    if (done === true) return value;
  }
};
