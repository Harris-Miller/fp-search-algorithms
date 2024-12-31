import * as R from 'ramda';

export const minimum = (a: number[]) =>
  a.reduce(
    R.minBy((x: number) => x),
    Infinity,
  );

export const maximum = (a: number[]) =>
  a.reduce(
    R.maxBy((x: number) => x),
    0,
  );
