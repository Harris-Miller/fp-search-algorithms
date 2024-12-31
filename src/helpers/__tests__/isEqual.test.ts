import { describe, expect, it } from 'bun:test';

import { isEqual } from '../isEqual';

type Foobar = { bar?: number; foo: number };

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

describe('isEqual', () => {
  it('partial objects are not equal 1', () => {
    const a: Foobar = { bar: 2, foo: 1 };
    const b: Foobar = { foo: 1 };

    expect(isEqual(a, b)).toBeFalse();
  });

  it('partial objects are not equal 1', () => {
    const a: Foobar = { bar: 2, foo: 1 };
    const b: Foobar = { foo: 1 };

    expect(isEqual(b, a)).toBeFalse();
  });

  it('works on Date instances', () => {
    const now = Date.now();
    const a = new Date(now);
    const b = new Date(now);

    expect(isEqual(a, b)).toBeTrue();
  });

  it.only('class instances and object literals with same props are not equal', () => {
    const instance = new Point(3, 4);
    const literal = { x: 3, y: 4 };

    expect(isEqual(instance, literal)).toBeFalse();
    expect(isEqual(literal, instance)).toBeFalse();
  });
});
