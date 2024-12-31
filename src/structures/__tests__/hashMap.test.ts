import { describe, expect, it } from 'bun:test';
import * as R from 'ramda';

import { HashMap } from '../hashMap';
import { HashSet } from '../hashSet';

describe('class HashMap', () => {
  describe('constructors', () => {
    describe('static method from', () => {
      it('constructs from Map', () => {
        const map = new Map([
          [[1], 10],
          [[1], 11],
          [[2], 2],
          [[3], 3],
        ]);

        const hashMap = HashMap.from(map);

        // notice how only second key `[1]` is retained
        expect(hashMap.get([1])).toBe(11);
        expect(hashMap.get([2])).toBe(2);
        expect(hashMap.get([3])).toBe(3);
        expect(hashMap.size).toBe(3);
      });

      it('constructs from entries array', () => {
        const arr: [[number], number][] = [
          [[1], 10],
          [[1], 11],
          [[2], 2],
          [[3], 3],
        ];

        const hashMap = HashMap.from(arr);

        // notice how only second key `[1]` is retained
        expect(hashMap.get([1])).toBe(11);
        expect(hashMap.get([2])).toBe(2);
        expect(hashMap.get([3])).toBe(3);
        expect(hashMap.size).toBe(3);
      });

      it('constructs from entries iterable', () => {
        const iter: Iterable<[[number], number]> = Iterator.from([
          [[1], 10],
          [[1], 11],
          [[2], 2],
          [[3], 3],
        ]);

        const hashMap = HashMap.from(iter);

        // notice how only second key `[1]` is retained
        expect(hashMap.get([1])).toBe(11);
        expect(hashMap.get([2])).toBe(2);
        expect(hashMap.get([3])).toBe(3);
        expect(hashMap.size).toBe(3);
      });

      it('constructs from Object', () => {
        const sym = Symbol('RandomKey');
        const obj = { 123: 'foo', key: 'bar', [sym]: 'value of Symbol' };
        const hashMap = HashMap.from(obj);

        // Note how 123 becomes a string
        expect(hashMap.get('123')).toBe('foo');
        expect(hashMap.get('key')).toBe('bar');
        expect(hashMap.size).toBe(2);
      });
    });

    describe('constructor', () => {
      it('constructs empty HashMap', () => {
        expect(new HashMap().size).toBe(0);
        expect(new HashMap(null).size).toBe(0);
        expect(new HashMap(undefined).size).toBe(0);
      });
    });
  });

  describe('utility', () => {
    describe('static method groupBy', () => {
      it('works as expected', () => {
        const inventory = [
          { name: 'asparagus', quantity: 9, type: 'vegetables' },
          { name: 'bananas', quantity: 5, type: 'fruit' },
          { name: 'goat', quantity: 23, type: 'meat' },
          { name: 'cherries', quantity: 12, type: 'fruit' },
          { name: 'fish', quantity: 22, type: 'meat' },
        ];

        const restock = { restock: true };
        const sufficient = { restock: false };
        const result = HashMap.groupBy(inventory, ({ quantity }) => (quantity < 6 ? restock : sufficient));

        expect(result.get(restock)?.length).toBe(1);
        expect(result.get(restock)).toEqual([{ name: 'bananas', quantity: 5, type: 'fruit' }]);

        expect(result.get(sufficient)?.length).toBe(4);
        expect(result.get(sufficient)).toEqual([
          { name: 'asparagus', quantity: 9, type: 'vegetables' },
          { name: 'goat', quantity: 23, type: 'meat' },
          { name: 'cherries', quantity: 12, type: 'fruit' },
          { name: 'fish', quantity: 22, type: 'meat' },
        ]);
      });
    });

    describe('method equals', () => {
      const a = new HashMap<number, { bar?: number; foo: number }>([[1, { bar: 2, foo: 1 }]]);
      const b = new HashMap<number, { bar?: number; foo: number }>([[1, { foo: 1 }]]);

      expect(a.equals(b)).toBeFalse();
      expect(b.equals(a)).toBeFalse();
    });

    describe('method clone', () => {
      it('cloning a HashMap returns true when used with equals in both directions', () => {
        const original = new HashMap([
          [1, 'one'],
          [2, 'two'],
          [3, 'three'],
        ]);

        const copy = original.clone();

        expect(original.size).toBe(3);
        expect(copy.size).toBe(3);

        expect(original.equals(copy)).toBeTrue();
        expect(copy.equals(original)).toBeTrue();
      });
    });
  });

  describe('mutations', () => {
    describe('method clear', () => {
      it('empties a HashMap', () => {
        const hashMap = new HashMap([
          [1, 'one'],
          [2, 'two'],
          [3, 'three'],
        ]);

        expect(hashMap.size).toBe(3);

        hashMap.clear();
        expect(hashMap.size).toBe(0);
        expect(hashMap.equals(new HashMap())).toBeTrue();
      });
    });
    describe('method delete', () => {
      it('deletes by key', () => {
        const one = [1];
        const hashMap = new HashMap([
          [one, 'one'],
          [[2], 'two'],
        ]);

        expect(hashMap.size).toBe(2);

        hashMap.delete(one);
        hashMap.delete([2]);

        expect(hashMap.size).toBe(0);
        expect(hashMap.has(one)).toBeFalse();
        expect(hashMap.has([1])).toBeFalse();
        expect(hashMap.has([2])).toBeFalse();
      });
    });

    describe('methods get/set', () => {
      it('gets and sets with all possible key types', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hashMap = new HashMap<any, number>();

        // by value
        hashMap.set('string', 1);
        hashMap.set(123, 2);
        hashMap.set(null, 3);
        hashMap.set(undefined, 4);
        hashMap.set(true, 5);
        hashMap.set(false, 6);
        hashMap.set(BigInt('9007199254740991'), 7);

        expect(hashMap.get('string')).toBe(1);
        expect(hashMap.get(123)).toBe(2);
        expect(hashMap.get(null)).toBe(3);
        expect(hashMap.get(undefined)).toBe(4);
        expect(hashMap.get(true)).toBe(5);
        expect(hashMap.get(false)).toBe(6);
        expect(hashMap.get(BigInt('9007199254740991'))).toBe(7);

        // by structure
        const now = Date.now();
        hashMap.set({ bar: 2, deep: { one: 1, three: 3, two: 2 }, foo: 1 }, 1);
        hashMap.set([0, 10], 2);
        hashMap.set(
          new Map([
            [1, 1],
            [2, 2],
          ]),
          3,
        );
        hashMap.set(new Set([1, 2]), 4);
        hashMap.set(new Date(now), 5);
        hashMap.set(new Int8Array([1, 2, 3]), 6);

        expect(hashMap.get({ bar: 2, deep: { one: 1, three: 3, two: 2 }, foo: 1 })).toBe(1);
        expect(hashMap.get([0, 10])).toBe(2);
        expect(
          hashMap.get(
            new Map([
              [1, 1],
              [2, 2],
            ]),
          ),
        ).toBe(3);
        expect(hashMap.get(new Set([1, 2]))).toBe(4);
        expect(hashMap.get(new Date(now))).toBe(5);
        expect(hashMap.get(new Int8Array([1, 2, 3]))).toBe(6);

        // when hashCode method exists
        hashMap.set(new HashSet([1, 2, 3]), 1);
        expect(hashMap.get(new HashSet([1, 2, 3]))).toBe(1);

        // by reference
        // eslint-disable-next-line func-style, prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-empty-function
        function funcDeclaration() {}
        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-empty-function
        const funcExpression = function () {};
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const arrowFunc = () => {};
        const weakMap = new WeakMap();
        const weakSet = new WeakSet();
        const promise = Promise.resolve();
        hashMap.set(funcDeclaration, 1);
        hashMap.set(funcExpression, 2);
        hashMap.set(arrowFunc, 3);
        hashMap.set(weakMap, 4);
        hashMap.set(weakSet, 5);
        hashMap.set(promise, 6);
        hashMap.set(Symbol.iterator, 7);

        expect(hashMap.get(funcDeclaration)).toBe(1);
        expect(hashMap.get(funcExpression)).toBe(2);
        expect(hashMap.get(arrowFunc)).toBe(3);
        expect(hashMap.get(weakMap)).toBe(4);
        expect(hashMap.get(weakSet)).toBe(5);
        expect(hashMap.get(promise)).toBe(6);
        expect(hashMap.get(Symbol.iterator)).toBe(7);
      });
    });
  });

  describe('iterables', () => {
    describe('methods [Symbol.iterator]/entries', () => {
      it('return entries iterable', () => {
        const entriesArray: [[number], string][] = [
          [[1], 'a'],
          [[2], 'b'],
          [[3], 'c'],
        ];
        const hashMap = new HashMap(entriesArray);

        const fromSymbolIterator = hashMap[Symbol.iterator]().toArray();
        expect(fromSymbolIterator.length).toBe(3);
        expect(fromSymbolIterator).toContainAllValues(entriesArray);

        const fromEntries = hashMap.entries().toArray();
        expect(fromEntries.length).toBe(3);
        expect(fromEntries).toContainAllValues(entriesArray);
      });
    });

    describe('methods keys/values', () => {
      it('return keys and values iterables', () => {
        const entriesArray: [[number], string][] = [
          [[1], 'a'],
          [[2], 'b'],
          [[3], 'c'],
        ];
        const hashMap = new HashMap(entriesArray);

        const fromSymbolIterator = hashMap.keys().toArray();
        expect(fromSymbolIterator.length).toBe(3);
        expect(fromSymbolIterator).toContainAllValues(entriesArray.map(([k]) => k));

        const fromEntries = hashMap.values().toArray();
        expect(fromEntries.length).toBe(3);
        expect(fromEntries).toContainAllValues(entriesArray.map(([, v]) => v));
      });
    });

    describe('method forEach', () => {
      it('correctly passes to callback function value and key', () => {
        const entriesArray: [[number], string][] = [
          [[1], 'a'],
          [[2], 'b'],
          [[3], 'c'],
        ];
        const hashMap = new HashMap(entriesArray);

        const copy: [[number], string][] = [];
        hashMap.forEach((v, k) => {
          copy.push([k, v]);
        });

        expect(copy).toContainAllValues(entriesArray);
      });
    });
  });

  describe('reductions', () => {
    describe('method map', () => {
      it('creates new HashMap with exact same keys with values mapped via callback function', () => {
        const hashMap = new HashMap([
          [[1], 'a'],
          [[2], 'b'],
          [[3], 'c'],
        ]);
        const mapped = hashMap.map((v, k) => {
          if (k[0] < 3) return v.charCodeAt(0);
          return v.charCodeAt(0) * -1;
        });

        const shouldMatch = new HashMap([
          [[1], 97],
          [[2], 98],
          [[3], -99],
        ]);

        expect(mapped.equals(shouldMatch)).toBeTrue();
      });
    });

    describe('method filter', () => {
      it('filters out keys that do not pass predicate', () => {
        const hashMap = new HashMap([
          [[1], 'a'],
          [[2], 'b'],
          [[3], 'c'],
        ]);

        const filtered = hashMap.filter((v, k) => k[0] < 2 || v === 'c');

        const shouldMatch = new HashMap([
          [[1], 'a'],
          [[3], 'c'],
        ]);

        expect(filtered.equals(shouldMatch)).toBeTrue();
      });
    });

    describe('method find', () => {
      it('finds first via predicate or undefined if not found', () => {
        const hashMap = new HashMap([
          [[1], 'a'],
          [[2], 'b'],
          [[3], 'c'],
        ]);

        const r1 = hashMap.find(v => v === 'c');
        const r2 = hashMap.find((_v, k) => k[0] > 1);
        const r3 = hashMap.find(v => v === 'foobar');

        expect(r1).toEqual([[3], 'c']);
        expect(r2).toEqual([[2], 'b']);
        expect(r3).toBeUndefined();
      });
    });

    describe('method reduce', () => {
      it('reduces using first value in iteration when not passed initial value', () => {
        const hashMap = new HashMap<string, number>([
          ['a', 1],
          ['b', 2],
          ['c', 3],
        ]);

        const result = hashMap.reduce((l, r) => l + r);
        expect(result).toBe(6);
      });

      it('throws when not passed initial value when HashMap is empty', () => {
        const hashMap = new HashMap<number, number>();
        // notice how not passing a second argument behaviors differently...
        const shouldThrow = () => {
          return hashMap.reduce((l, r) => l + r);
        };

        // than passing `undefined` as the second argument
        const shouldNotThrow = () => {
          return hashMap.reduce<number | undefined>((l, r) => (l ?? 0) + r, undefined);
        };

        // this matches the behaviors of Array#reduce

        expect(shouldThrow).toThrow();
        expect(shouldNotThrow()).toBeUndefined();
      });

      it('reduces using passed initial value', () => {
        const hashMap = new HashMap<string, number>([
          ['a', 1],
          ['b', 2],
          ['c', 3],
        ]);

        const result = hashMap.reduce((l, r, k) => {
          if (k === 'b') return l;
          return l + r;
        }, 10);
        expect(result).toBe(14);
      });

      it('returns initial value when HashMap is empty', () => {
        const hashMap = new HashMap<string, number>();
        const result = hashMap.reduce((l, r) => l + r, 10);
        expect(result).toBe(10);
      });
    });

    describe('method some', () => {
      it('returns false when HashMap is empty', () => {
        expect(new HashMap<string, number>().some(v => v % 2 === 0)).toBeFalse();
      });

      it('returns as expected', () => {
        expect(
          new HashMap([
            ['a', 2],
            ['b', 4],
            ['c', 6],
          ]).some(v => v % 2 === 0),
        ).toBeTrue();
        expect(
          new HashMap([
            ['a', 2],
            ['b', 4],
            ['c', 6],
            ['d', 7],
          ]).some(v => v % 2 === 0),
        ).toBeTrue();
        expect(
          new HashMap([
            ['a', 1],
            ['b', 3],
            ['c', 5],
          ]).some(v => v % 2 === 0),
        ).toBeFalse();
      });
    });

    describe('method every', () => {
      it('returns false when HashMap is empty', () => {
        expect(new HashMap<string, number>().every(v => v % 2 === 0)).toBeTrue();
      });

      it('returns as expected', () => {
        expect(
          new HashMap([
            ['a', 2],
            ['b', 4],
            ['c', 6],
          ]).every(v => v % 2 === 0),
        ).toBeTrue();
        expect(
          new HashMap([
            ['a', 2],
            ['b', 4],
            ['c', 6],
            ['d', 7],
          ]).every(v => v % 2 === 0),
        ).toBeFalse();
        expect(
          new HashMap([
            ['a', 1],
            ['b', 3],
            ['c', 5],
          ]).every(v => v % 2 === 0),
        ).toBeFalse();
      });
    });
  });

  describe('handling large sizes', () => {
    const toShuffled = <T>(array: T[]): T[] => {
      const copy = [...array];
      let currentIndex = array.length;

      // While there remain elements to shuffle...
      while (currentIndex !== 0) {
        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        [copy[currentIndex], copy[randomIndex]] = [copy[randomIndex], copy[currentIndex]];
      }
      return copy;
    };

    it('works as expected', () => {
      // simulate a 100x100 grid with values set to the string concat of their coordinates
      const coords = new Array<[number, number]>(100 * 10);
      let i = 0;
      for (const r of R.range(0, 100)) {
        for (const c of R.range(0, 10)) {
          coords[i] = [r, c];
          i += 1;
        }
      }

      const hashMap = new HashMap(coords.map<[[number, number], string]>(([r, c]) => [[r, c], `${r}${c}`]));

      for (const [r, c] of coords) {
        expect(hashMap.get([r, c])).toBe(`${r}${c}`);
      }

      const randomOrderCoords = toShuffled(coords);
      const removedCoords: [number, number][] = [];
      const remainingCoords = [...coords];

      for (const coord of randomOrderCoords) {
        hashMap.delete(coord);
        removedCoords.push(coord);
        remainingCoords.splice(remainingCoords.findIndex(R.equals(coord)), 1);

        for (const removedCoord of removedCoords) {
          expect(hashMap.has(removedCoord)).toBeFalse();
        }

        for (const [r, c] of remainingCoords) {
          expect(hashMap.get([r, c])).toBe(`${r}${c}`);
        }
      }
    });
  });
});
