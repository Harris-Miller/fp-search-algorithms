/* eslint-disable no-console */
import * as R from 'ramda';

import { OrderedMap } from '../src/structures/orderedMap';

const randomNums = R.range(0, 1_000_000).map<[number, undefined]>(() => [
  Math.trunc(Math.random() * 100_000_000),
  undefined,
]);

const randomTuples = randomNums.map<[[number], undefined]>(([k, v]) => [[k], v]);
const randomObjects = randomNums.map<[{ val: number }, undefined]>(([k, v]) => [{ val: k }, v]);

let t0: number;
let t1: number;

let map: Map<number, undefined>;
let orderedMap: OrderedMap<number, undefined>;
let orderedMapTuple: OrderedMap<[number], undefined>;
// let orderedMapObj: OrderedMap<{ val: number }, undefined>;

t0 = performance.now();
map = new Map(randomNums);
t1 = performance.now();
console.log('Map constructor passed array', t1 - t0);

t0 = performance.now();
orderedMap = new OrderedMap(randomNums);
t1 = performance.now();
console.log('OrderedMap constructor passed array', t1 - t0);

t0 = performance.now();
orderedMapTuple = new OrderedMap(randomTuples);
t1 = performance.now();
console.log('OrderedMap constructor passed array (tuples)', t1 - t0);

// t0 = performance.now();
// orderedMapObj = new OrderedMap(randomObjects);
// t1 = performance.now();
// console.log('OrderedMap constructor passed array (objects)', t1 - t0);

console.log('');

t0 = performance.now();
randomNums.forEach(([k, v]) => {
  map.set(k, v);
});
t1 = performance.now();
console.log('Map forEach set existing', t1 - t0);

t0 = performance.now();
randomNums.forEach(([k, v]) => {
  orderedMap.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap forEach set existing', t1 - t0);

t0 = performance.now();
randomTuples.forEach(([k, v]) => {
  orderedMapTuple.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap forEach set existing (tuples)', t1 - t0);

// t0 = performance.now();
// randomObjects.forEach(([k, v]) => {
//   orderedMapObj.set(k, v);
// });
// t1 = performance.now();
// console.log('OrderedMap forEach set existing (objects)', t1 - t0);

console.log('');

let keys = map.keys().toArray();
t0 = performance.now();
keys.forEach(k => {
  map.delete(k);
});
t1 = performance.now();
console.log('Map forEach delete', t1 - t0);

keys = orderedMap.keys().toArray();
t0 = performance.now();
keys.forEach(k => {
  orderedMap.delete(k);
});
t1 = performance.now();
console.log('OrderedMap forEach delete', t1 - t0);

const keysT = orderedMapTuple.keys().toArray();
t0 = performance.now();
keysT.forEach(k => {
  orderedMapTuple.delete(k);
});
t1 = performance.now();
console.log('OrderedMap forEach delete (tuples)', t1 - t0);

// const keysO = orderedMapObj.keys().toArray();
// t0 = performance.now();
// keysO.forEach(k => {
//   orderedMapObj.delete(k);
// });
// t1 = performance.now();
// console.log('OrderedMap forEach delete (objects)', t1 - t0);

console.log('');

t0 = performance.now();
map = new Map();
randomNums.forEach(([k, v]) => {
  map.set(k, v);
});
t1 = performance.now();
console.log('Map forEach set', t1 - t0);

t0 = performance.now();
orderedMap = new OrderedMap();
randomNums.forEach(([k, v]) => {
  orderedMap.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap forEach set', t1 - t0);

t0 = performance.now();
orderedMapTuple = new OrderedMap();
randomTuples.forEach(([k, v]) => {
  orderedMapTuple.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap forEach set (tuples)', t1 - t0);

// t0 = performance.now();
// orderedMapObj = new OrderedMap();
// randomObjects.forEach(([k, v]) => {
//   orderedMapObj.set(k, v);
// });
// t1 = performance.now();
// console.log('OrderedMap forEach set (objects)', t1 - t0);
