import { getHash } from './hashing';

/** @internal */
export const createPath = <T>(prevMap: Map<number, T>, final: T) => {
  const path: T[] = [final];
  let prev = prevMap.get(getHash(final));
  while (prev != null) {
    path.unshift(prev);
    prev = prevMap.get(getHash(prev));
  }
  return path;
};
