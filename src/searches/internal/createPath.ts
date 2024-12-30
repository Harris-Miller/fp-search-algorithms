import type { HashMap } from '../../structures/hashMap';

/** @internal */
export const createPath = <T>(prevMap: HashMap<T, T>, final: T): T[] => {
  const path: T[] = [final];
  let prev = prevMap.get(final);
  while (prev != null) {
    path.unshift(prev);
    prev = prevMap.get(prev);
  }
  return path;
};
