import { isNil } from './utils';

/**
 * Takes an `initial` seed value and applies `next` to it
 * until either `found` returns `true` or `next` returns null
 */
export const findIterate = <T>(
  next: (a: T) => T | undefined,
  found: (a: T) => boolean,
  initial: T | undefined
): T | null => {
  if (isNil(initial)) return null;
  if (found(initial)) return initial;
  return findIterate(next, found, next(initial));
};
