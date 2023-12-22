/* eslint-disable no-continue */
import { isNil, isNotNil, minBy } from 'ramda';

import type { Container } from './utils/common';
// import { snd } from './common';

// const reconstructPath = <T>(cameFrom: Map<T, T>, start: T) => {
//   let current = start;
//   const totalPath = [current];
//   while (cameFrom.has(current)) {
//     current = cameFrom.get(current)!;
//     totalPath.unshift(current);
//   }
//   return totalPath;
// };

// findIterateM :: Monad m => (a -> m (Maybe a)) -> (a -> m Bool) -> a -> m (Maybe a)
// findIterateM nextM foundM initial = do
//   found <- foundM initial
//   if found
//   then return $ Just initial
//   else nextM initial >>= maybe (return Nothing) (findIterateM nextM foundM)

export const generalizedSearch = <T>(
  container: Container<T>,
  isNextBetter: (previous: T[], next: T[]) => boolean,
  getNeighbors: (n: T) => T[],
  isFound: (n: T) => boolean,
  start: T
): T[] | undefined => {
  container.push(start);
  const visited = new Set<T>([start]);
  const paths = new Map<T, T[]>();
  // const gScore = new Map<T, number>([[start, 0]]);
  // const fScore = new Map<T, number>([[start, remaining(start)]]);

  while (container.size()) {
    console.log(container.size());
    const current = container.pop()!;

    if (isFound(current)) return paths.get(current);

    const neighbors = getNeighbors(current);

    const pathToCurrent = [...(paths.get(current) ?? [])];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;

      visited.add(neighbor);

      const oldPathToNeighbor = paths.get(neighbor);
      if (isNotNil(oldPathToNeighbor)) {
        const newPathToNeighbor = [...pathToCurrent, neighbor];
        if (!isNextBetter(oldPathToNeighbor, newPathToNeighbor)) continue;
      }

      container.push(neighbor);
      paths.set(neighbor, [...pathToCurrent, neighbor]);
    }

    console.log(container.size());
  }

  return undefined;
};
