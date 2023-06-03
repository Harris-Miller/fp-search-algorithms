export const identity = <T>(value: T): T => value;
export const isNil = (value: any): value is null | undefined => value == null;
export const fst = <A, B>(tuple: [A, B]): A => tuple[0];
export const snd = <A, B>(tuple: [A, B]): B => tuple[1];
export const head = <T>(list: T[]): T | undefined => list[0];
export const last = <T>(list: T[]): T | undefined => list[list.length - 1];
export const tail = <T>(list: T[]): T[] => Array.prototype.slice.call(list, 1, Infinity);
export const zipWith = <A, B, C>(fn: (a: A, b: B) => C, as: A[], bs: B[]): C[] => {
  const len = Math.min(as.length, bs.length);
  const cs = Array(len);
  let i = 0;
  while (i < len) {
    cs[i] = fn(as[i], bs[i]);
    i += 1;
  }
  return cs;
};
