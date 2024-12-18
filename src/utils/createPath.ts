import type { Dict } from '../structures/dict';

/** @internal */
export const createPath = <T>(prevMap: Dict<T, T>, final: T) => {
  const path: T[] = [final];
  let prev = prevMap.get(final);
  while (prev != null) {
    path.unshift(prev);
    prev = prevMap.get(prev);
  }
  return path;
};
