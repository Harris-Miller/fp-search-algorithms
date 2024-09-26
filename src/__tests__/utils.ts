const max = (x: number, y: number): number => (y > x ? y : x);

export const makeGrid = (s: string) => {
  const l = s.length;
  let i = 0;
  let row = 0;
  let col = 0;

  const results = new Map<string, string>();

  while (i < l) {
    const char = s.charAt(i);
    if (char === '\n') {
      row += 1;
      col = 0;
    } else {
      results.set(`${row}, ${col}`, char);
      col += 1;
    }
    i += 1;
  }

  return results;
};

export const strToPoint = (s: string) => s.split(', ').map(Number) as [number, number];
export const pointToStr = ([r, c]: [number, number]) => `${r}, ${c}`;

export const findMax = (grid: Map<string, string>) =>
  [...grid.keys()]
    .map(strToPoint)
    .reduce<[number, number]>(([mr, mc], [r, c]) => [max(mr, r), max(mc, c)] as [number, number], [0, 0]);

export const getNeighbors4 = (s: string) => {
  const [r, c] = strToPoint(s);
  const ns = [
    [r - 1, c],
    [r, c + 1],
    [r + 1, c],
    [r, c - 1],
  ] as [number, number][];
  return ns.map(pointToStr);
};

/**
 * Returns a function that always returns the given value. Note that for
 * non-primitives the value returned is a reference to the original value.
 *
 * This function is known as `const`, `constant`, or `K` (for K combinator) in
 * other languages and libraries.
 */
export const always =
  <T>(val: T) =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (..._args: unknown[]): T =>
    val;
