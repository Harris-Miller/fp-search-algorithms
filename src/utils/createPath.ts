import { toString } from 'ramda';

/** @internal */
export const createPath = <T>(prevMap: Map<string, T>, final: T) => {
  const path: T[] = [final];
  let prev = prevMap.get(toString(final));
  while (prev) {
    path.unshift(prev);
    prev = prevMap.get(toString(prev));
  }
  return path;
};
