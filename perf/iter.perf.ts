/* eslint-disable no-console */
/* eslint-disable no-plusplus */
import * as R from 'ramda';

import { maximum, minimum } from './helpers';

const randomNums = R.range(0, 100_000).map(() => Math.trunc(Math.random() * 10_000_000));
// const reducedSet1 = randomNums.filter(() => Math.random() < 0.5);
// const reducedSet2 = randomNums.filter(() => Math.random() < 0.5);

const c1: number[] = [];
const c2: number[] = [];
const c3: number[] = [];

let t0: number;
let t1: number;

const setFull = new Set(randomNums);
// const setReduced1 = new Set(reducedSet1);
// const setReduced2 = new Set(reducedSet2);

for (let i = 0; i < 1000; ++i) {
  const copy = new Set();
  t0 = performance.now();
  for (const v of setFull) {
    copy.add(v);
  }
  t1 = performance.now();
  c1.push(t1 - t0);
}

for (let i = 0; i < 1000; ++i) {
  const copy = new Set();
  t0 = performance.now();
  for (const v of setFull.keys()) {
    copy.add(v);
  }
  t1 = performance.now();
  c2.push(t1 - t0);
}

for (let i = 0; i < 1000; ++i) {
  const copy = new Set();
  t0 = performance.now();
  const iter = setFull.keys();
  let visit = iter.next();
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  while (!visit.done) {
    copy.add(visit.value);
    visit = iter.next();
  }
  t1 = performance.now();
  c3.push(t1 - t0);
}

console.log('for..of setFull');
console.log('lowest', minimum(c1));
console.log('highest', maximum(c1));
console.log('average', R.sum(c1) / c1.length);
console.log('mean', R.mean(c1));
console.log('median', R.median(c1));

console.log('');

console.log('for..of setFull.keys()');
console.log('lowest', minimum(c2));
console.log('highest', maximum(c2));
console.log('average', R.sum(c2) / c2.length);
console.log('mean', R.mean(c2));
console.log('median', R.median(c2));

console.log('');

console.log('while(!visit.done)');
console.log('lowest', minimum(c3));
console.log('highest', maximum(c3));
console.log('average', R.sum(c3) / c3.length);
console.log('mean', R.mean(c3));
console.log('median', R.median(c3));
