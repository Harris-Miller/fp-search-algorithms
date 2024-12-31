/* eslint-disable complexity */
import { isEqual } from '../helpers/isEqual';
import { HashSet } from '../structures/hashSet';

import { dijkstraAssoc } from './dijkstra';

/**
 * Performs `k` best-first searches using Yen's algorithm
 * Returns an array of `{ cost: number; path: T[] }`
 * If array has less then k items, there were less than that many total paths to the solution
 * If an empty array is returned, there are zero paths to the solution
 *
 * @category Yen
 * @param getNextStates - a function to generate list of neighboring states with associated transition costs given the current state
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 * @param k - number of shortest paths to find, returned in order of shortest
 */
export const yenAssoc = <T>(
  getNextStates: (state: T) => [T, number][],
  determineIfFound: (state: T) => boolean,
  initial: T,
  k: number,
): { cost: number; path: T[] }[] => {
  const shortestPath = dijkstraAssoc(getNextStates, determineIfFound, initial);
  if (shortestPath === undefined) return [];

  // Determine the shortest path from the source to the sink.
  const routes: { cost: number; path: T[] }[] = [shortestPath];
  // Initialize the set to store the potential kth shortest path.
  const candidates: { cost: number; path: T[] }[] = [];

  for (let ki = 1; ki < k; ki += 1) {
    // The spur node ranges from the first node to the next to last node in the previous k-shortest path.
    const { path } = routes[ki - 1];

    // Iterate over every node except the sink node.
    for (let i = 0; i <= path.length - 2; i += 1) {
      // Spur node is retrieved from the previous k-shortest path, k − 1.
      const spurNode = path[i];
      // The sequence of nodes from the source to the spur node of the previous k-shortest path.
      const rootPath = path.slice(0, i);

      const edgesToFilter = new HashSet<[T, T]>();
      for (const { path: p } of routes) {
        if (isEqual(rootPath, p.slice(0, i))) {
          edgesToFilter.add([p[i], p[i + 1]]);
        }
      }

      const verticesToFilter = new HashSet<T>();
      for (const node of rootPath) {
        if (!isEqual(node, spurNode)) {
          verticesToFilter.add(node);
        }
      }

      // Calculate the spur path from the spur node to the sink.
      // Consider also checking if any spurPath found
      const spurNext = (cs: T) =>
        getNextStates(cs).filter(([ns]) => !edgesToFilter.has([cs, ns]) && !verticesToFilter.has(ns));

      const dResult = dijkstraAssoc(spurNext, determineIfFound, spurNode);
      if (dResult === undefined) continue;

      const { path: dPath } = dResult;

      // Entire path is made up of the root path and spur path.
      const totalPath = [...rootPath, ...dPath];
      let totalCost = 0;
      for (let j = 0; j < totalPath.length - 2; j += 1) {
        const nextStates = getNextStates(totalPath[j]);
        const [, found] = nextStates.find(([n]) => isEqual(n, totalPath[j + 1]))!;
        totalCost += found;
      }

      // Add the potential k-shortest path to the heap
      if (!candidates.find(({ path: bp }) => isEqual(bp, totalPath))) {
        candidates.push({ cost: totalCost, path: totalPath });
      }
    }

    if (candidates.length === 0) {
      break;
    }

    candidates.sort((l, r) => l.cost - r.cost);
    const bb = candidates.shift()!;
    routes.push(bb);
  }

  return routes;
};

/**
 * Performs `k` best-first searches using Yen's algorithm
 * Returns an array of `{ cost: number; path: T[] }`
 * If array has less then k items, there were less than that many total paths to the solution
 * If an empty array is returned, there are zero paths to the solution
 *
 * @category Yen
 * @param getNextStates - a function to generate list of neighboring states given the current state
 * @param getCost - a function to generate transition costs between neighboring states
 * @param determineIfFound - a function to determine if solution found
 * @param initial - initial state
 * @param k - number of shortest paths to find, returned in order of shortest
 */
export const yen = <T>(
  getNextStates: (state: T) => T[],
  getCost: (from: T, to: T) => number,
  determineIfFound: (state: T) => boolean,
  initial: T,
  k: number,
): { cost: number; path: T[] }[] => {
  const nextAssoc = (state: T) => getNextStates(state).map(n => [n, getCost(state, n)] as [T, number]);
  return yenAssoc(nextAssoc, determineIfFound, initial, k);
};
