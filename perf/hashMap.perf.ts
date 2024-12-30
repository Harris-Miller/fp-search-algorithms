/* eslint-disable no-console */
import * as R from 'ramda';

import { HashMap } from '../src/structures/hashMap';

const randomNums = R.range(0, 100_000).map<[number, undefined]>(() => [
  Math.trunc(Math.random() * 10_000_000),
  undefined,
]);

let t0: number;
let t1: number;

let set: Map<number, undefined>;
let hashSet: HashMap<number, undefined>;

t0 = performance.now();
set = new Map<number, undefined>(randomNums);
t1 = performance.now();
console.log('native Set constructor passed array', t1 - t0);

t0 = performance.now();
hashSet = new HashMap<number, undefined>(randomNums);
t1 = performance.now();
console.log('HashSet constructor passed array', t1 - t0);

console.log('');

t0 = performance.now();
set = new Map<number, undefined>();
randomNums.forEach(([k, v]) => {
  set.set(k, v);
});
t1 = performance.now();
console.log('native Set added forEach', t1 - t0);

t0 = performance.now();
hashSet = new HashMap<number, undefined>(randomNums);
randomNums.forEach(([k, v]) => {
  hashSet.set(k, v);
});
t1 = performance.now();
console.log('HashSet added forEach', t1 - t0);
