import { minBy } from 'ramda';

import { snd } from './common';

// function reconstruct_path(cameFrom, current)
//     total_path := {current}
//     while current in cameFrom.Keys:
//         current := cameFrom[current]
//         total_path.prepend(current)
//     return total_path

const reconstructPath = <T>(cameFrom: Map<T, T>, start: T) => {
  let current = start;
  const totalPath = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    totalPath.unshift(current);
  }
  return totalPath;
};

export const aStar = <T>(
  getNeighbors: (n: T) => T[],
  cost: (a: T, b: T) => number,
  remaining: (n: T) => number,
  found: (a: T) => boolean,
  start: T
) => {
  const openSet = new Set<T>([start]);
  const cameFrom = new Map<T, T>();
  const gScore = new Map<T, number>([[start, 0]]);
  const fScore = new Map<T, number>([[start, remaining(start)]]);

  while (openSet.size) {
    // super inefficient, but fine to get this working
    const [first, ...rest] = [...openSet].map(x => [x, fScore.get(x)] as [T, number]);
    const [current] = rest.reduce<[T, number]>(
      minBy<[T, number]>(snd) as (a: [T, number], b: [T, number]) => [T, number],
      first
    );

    if (found(current)) return reconstructPath(cameFrom, current);

    openSet.delete(current);

    const neighbors = getNeighbors(current);
    for (const neighbor of neighbors) {
      const tentativeGScore = gScore.get(current)! + cost(current, neighbor);

      if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + remaining(neighbor));
        openSet.add(neighbor);
      }
    }
  }

  return undefined;
};
