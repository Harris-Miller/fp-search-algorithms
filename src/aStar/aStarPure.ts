import { createPath } from '../utils/common';
import { priorityQueue } from '../utils/priorityQueue';

export const aStar = <T>(
  getNeighbors: (n: T) => T[],
  cost: (a: T, b: T) => number,
  remaining: (n: T) => number,
  found: (a: T) => boolean,
  start: T
): [number, T[]] | undefined => {
  const cameFrom = new Map<T, T>();
  const gScore = new Map<T, number>([[start, 0]]);
  const fScore = new Map<T, number>([[start, remaining(start)]]);

  const queue = priorityQueue((a: T, b: T) => {
    const aScore = fScore.get(a)!;
    const bScore = fScore.get(b)!;
    return aScore < bScore;
  });

  queue.push(start);

  while (!queue.isEmpty()) {
    const current = queue.pop()!;

    if (found(current)) {
      const path = createPath(cameFrom, current);
      const totalCost = gScore.get(current)!;
      return [totalCost, path];
    }

    const neighbors = getNeighbors(current);
    for (const neighbor of neighbors) {
      const tentativeGScore = gScore.get(current)! + cost(current, neighbor);

      if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + remaining(neighbor));
        queue.push(neighbor);
      }
    }
  }

  return undefined;
};
