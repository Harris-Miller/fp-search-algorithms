/** @internal */
export const createPath = <T>(prevMap: Map<T, T>, final: T) => {
  const path: T[] = [final];
  let prev = prevMap.get(final);
  while (prev) {
    path.unshift(prev);
    prev = prevMap.get(prev);
  }
  return path;
};
