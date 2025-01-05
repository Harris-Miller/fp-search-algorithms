/* eslint-disable no-console */
import * as R from 'ramda';

import { HashMap } from '../src/structures/hashMap';
import { OrderedMap } from '../src/structures/orderedMap';
import { OrderedMap as OrderedMap2 } from '../src/structures/orderedMap2';

const randomNums = R.range(0, 100_000).map<[number, undefined]>(() => [
  Math.trunc(Math.random() * 100_000_000),
  undefined,
]);

const randomTuples = randomNums.map<[[number], undefined]>(([k, v]) => [[k], v]);
const randomObjects = randomNums.map<[{ val: number }, undefined]>(([k, v]) => [{ val: k }, v]);

let t0: number;
let t1: number;

let map: Map<number, undefined>;
let hashMap: HashMap<number, undefined>;
let hashMapTuple: HashMap<[number], undefined>;
let orderedMap: OrderedMap<number, undefined>;
let orderedMapTuple: OrderedMap<[number], undefined>;
let orderedMapObj: OrderedMap<{ val: number }, undefined>;
let orderedMap2: OrderedMap2<number, undefined>;
let orderedMap2Tuple: OrderedMap2<[number], undefined>;
let orderedMap2Obj: OrderedMap2<{ val: number }, undefined>;

t0 = performance.now();
map = new Map(randomNums);
t1 = performance.now();
console.log('Map constructor', t1 - t0);

t0 = performance.now();
hashMap = new HashMap(randomNums);
t1 = performance.now();
console.log('HashMap constructor', t1 - t0);

t0 = performance.now();
hashMapTuple = new HashMap(randomTuples);
t1 = performance.now();
console.log('HashMap constructor (tuples)', t1 - t0);

t0 = performance.now();
orderedMap = new OrderedMap(randomNums);
t1 = performance.now();
console.log('OrderedMap constructor', t1 - t0);

t0 = performance.now();
orderedMapTuple = new OrderedMap(randomTuples);
t1 = performance.now();
console.log('OrderedMap constructor (tuples)', t1 - t0);

t0 = performance.now();
orderedMapObj = new OrderedMap(randomObjects);
t1 = performance.now();
console.log('OrderedMap constructor (objects)', t1 - t0);

t0 = performance.now();
orderedMap2 = new OrderedMap2(randomNums);
t1 = performance.now();
console.log('OrderedMap2 constructor', t1 - t0);

t0 = performance.now();
orderedMap2Tuple = new OrderedMap2(randomTuples);
t1 = performance.now();
console.log('OrderedMap2 constructor (tuples)', t1 - t0);

t0 = performance.now();
orderedMap2Obj = new OrderedMap2(randomObjects);
t1 = performance.now();
console.log('OrderedMap2 constructor (objects)', t1 - t0);

//
//
console.log('');
//
//

t0 = performance.now();
randomNums.forEach(([k, v]) => {
  map.set(k, v);
});
t1 = performance.now();
console.log('Map set existing', t1 - t0);

t0 = performance.now();
randomNums.forEach(([k, v]) => {
  hashMap.set(k, v);
});
t1 = performance.now();
console.log('HashMap set existing', t1 - t0);

t0 = performance.now();
randomTuples.forEach(([k, v]) => {
  hashMapTuple.set(k, v);
});
t1 = performance.now();
console.log('HashMap set existing (tuples)', t1 - t0);

t0 = performance.now();
randomNums.forEach(([k, v]) => {
  orderedMap.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap set existing', t1 - t0);

t0 = performance.now();
randomTuples.forEach(([k, v]) => {
  orderedMapTuple.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap set existing (tuples)', t1 - t0);

t0 = performance.now();
randomObjects.forEach(([k, v]) => {
  orderedMapObj.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap set existing (objects)', t1 - t0);

t0 = performance.now();
randomNums.forEach(([k, v]) => {
  orderedMap2.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap2 set existing', t1 - t0);

t0 = performance.now();
randomTuples.forEach(([k, v]) => {
  orderedMap2Tuple.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap2 set existing (tuples)', t1 - t0);

t0 = performance.now();
randomObjects.forEach(([k, v]) => {
  orderedMap2Obj.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap2 set existing (objects)', t1 - t0);

//
//
console.log('');
//
//

let keys = map.keys().toArray();
t0 = performance.now();
keys.forEach(k => {
  map.delete(k);
});
t1 = performance.now();
console.log('Map delete', t1 - t0);

keys = hashMap.keys().toArray();
t0 = performance.now();
keys.forEach(k => {
  hashMap.delete(k);
});
t1 = performance.now();
console.log('HashMap delete', t1 - t0);

let keysT = hashMapTuple.keys().toArray();
t0 = performance.now();
keysT.forEach(k => {
  hashMapTuple.delete(k);
});
t1 = performance.now();
console.log('HashMap delete (tuples)', t1 - t0);

keys = orderedMap.keys().toArray();
t0 = performance.now();
keys.forEach(k => {
  orderedMap.delete(k);
});
t1 = performance.now();
console.log('OrderedMap delete', t1 - t0);

keysT = orderedMapTuple.keys().toArray();
t0 = performance.now();
keysT.forEach(k => {
  orderedMapTuple.delete(k);
});
t1 = performance.now();
console.log('OrderedMap delete (tuples)', t1 - t0);

let keysO = orderedMapObj.keys().toArray();
t0 = performance.now();
keysO.forEach(k => {
  orderedMapObj.delete(k);
});
t1 = performance.now();
console.log('OrderedMap delete (objects)', t1 - t0);

keys = orderedMap2.keys().toArray();
t0 = performance.now();
keys.forEach(k => {
  orderedMap2.delete(k);
});
t1 = performance.now();
console.log('OrderedMap2 delete', t1 - t0);

keysT = orderedMap2Tuple.keys().toArray();
t0 = performance.now();
keysT.forEach(k => {
  orderedMap2Tuple.delete(k);
});
t1 = performance.now();
console.log('OrderedMap2 delete (tuples)', t1 - t0);

keysO = orderedMap2Obj.keys().toArray();
t0 = performance.now();
keysO.forEach(k => {
  orderedMap2Obj.delete(k);
});
t1 = performance.now();
console.log('OrderedMap2 delete (objects)', t1 - t0);

//
//
console.log('');
//
//

t0 = performance.now();
map = new Map();
randomNums.forEach(([k, v]) => {
  map.set(k, v);
});
t1 = performance.now();
console.log('Map set', t1 - t0);

t0 = performance.now();
hashMap = new HashMap();
randomNums.forEach(([k, v]) => {
  hashMap.set(k, v);
});
t1 = performance.now();
console.log('HashMap set', t1 - t0);

t0 = performance.now();
hashMapTuple = new HashMap();
randomTuples.forEach(([k, v]) => {
  hashMapTuple.set(k, v);
});
t1 = performance.now();
console.log('HashMap set (tuples)', t1 - t0);

t0 = performance.now();
orderedMap = new OrderedMap();
randomNums.forEach(([k, v]) => {
  orderedMap.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap set', t1 - t0);

t0 = performance.now();
orderedMapTuple = new OrderedMap();
randomTuples.forEach(([k, v]) => {
  orderedMapTuple.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap set (tuples)', t1 - t0);

t0 = performance.now();
orderedMapObj = new OrderedMap();
randomObjects.forEach(([k, v]) => {
  orderedMapObj.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap set (objects)', t1 - t0);

t0 = performance.now();
orderedMap2 = new OrderedMap2();
randomNums.forEach(([k, v]) => {
  orderedMap2.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap2 set', t1 - t0);

t0 = performance.now();
orderedMap2Tuple = new OrderedMap2();
randomTuples.forEach(([k, v]) => {
  orderedMap2Tuple.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap2 set (tuples)', t1 - t0);

t0 = performance.now();
orderedMap2Obj = new OrderedMap2();
randomObjects.forEach(([k, v]) => {
  orderedMap2Obj.set(k, v);
});
t1 = performance.now();
console.log('OrderedMap2 set (objects)', t1 - t0);
