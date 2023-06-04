import { readFileSync } from 'node:fs';

// @ts-expect-error
const hills = readFileSync(new URL('./hills.txt', import.meta.url));

describe('aStar', () => {
  it('works', () => {
    expect(true).toBeTruthy();
  });
});
