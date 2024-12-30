/* eslint-disable no-console */
import * as R from 'ramda';

import { HashSet } from '../src/structures/hashSet';

const randomNums = R.range(0, 100_000).map(() => Math.trunc(Math.random() * 10_000_000));

let t0: number;
let t1: number;

let set: Set<number>;
let hashSet: HashSet<number>;

t0 = performance.now();
set = new Set<number>(randomNums);
t1 = performance.now();
console.log('native Set constructor passed array', t1 - t0);

t0 = performance.now();
hashSet = new HashSet<number>(randomNums);
t1 = performance.now();
console.log('HashSet constructor passed array', t1 - t0);

console.log('');

t0 = performance.now();
set = new Set<number>();
randomNums.forEach(x => {
  set.add(x);
});
t1 = performance.now();
console.log('native Set added forEach', t1 - t0);

t0 = performance.now();
hashSet = new HashSet<number>(randomNums);
randomNums.forEach(x => {
  hashSet.add(x);
});
t1 = performance.now();
console.log('HashSet added forEach', t1 - t0);
