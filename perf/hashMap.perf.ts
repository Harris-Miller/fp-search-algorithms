/* eslint-disable no-console */
import * as R from 'ramda';

import { HashMap } from '../src/structures/hashMap';

import { HashMap as HashMapOrig } from './originals/hashMap.orig';

const randomNums = R.range(0, 1_000_000).map<[number, undefined]>(() => [
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
let hashMapObj: HashMap<{ val: number }, undefined>;
let hashMapOrig: HashMapOrig<number, undefined>;
let hashMapOrigTuple: HashMapOrig<[number], undefined>;
let hashMapOrigObj: HashMapOrig<{ val: number }, undefined>;

t0 = performance.now();
map = new Map(randomNums);
t1 = performance.now();
console.log('Map constructor passed array', t1 - t0);

t0 = performance.now();
hashMap = new HashMap(randomNums);
t1 = performance.now();
console.log('HashMap constructor passed array', t1 - t0);

t0 = performance.now();
hashMapOrig = new HashMapOrig(randomNums);
t1 = performance.now();
console.log('HashMapOrig constructor passed array', t1 - t0);

t0 = performance.now();
hashMapTuple = new HashMap(randomTuples);
t1 = performance.now();
console.log('HashMap constructor passed array (tuples)', t1 - t0);

t0 = performance.now();
hashMapOrigTuple = new HashMapOrig(randomTuples);
t1 = performance.now();
console.log('HashMapOrig constructor passed array (tuples)', t1 - t0);

t0 = performance.now();
hashMapObj = new HashMap(randomObjects);
t1 = performance.now();
console.log('HashMap constructor passed array (objects)', t1 - t0);

t0 = performance.now();
hashMapOrigObj = new HashMapOrig(randomObjects);
t1 = performance.now();
console.log('HashMapOrig constructor passed array (objects)', t1 - t0);

console.log('');

t0 = performance.now();
randomNums.forEach(([k, v]) => {
  map.set(k, v);
});
t1 = performance.now();
console.log('Map forEach set existing', t1 - t0);

t0 = performance.now();
randomNums.forEach(([k, v]) => {
  hashMap.set(k, v);
});
t1 = performance.now();
console.log('HashMap forEach set existing', t1 - t0);

t0 = performance.now();
randomNums.forEach(([k, v]) => {
  hashMapOrig.set(k, v);
});
t1 = performance.now();
console.log('HashMapOrig forEach set existing', t1 - t0);

t0 = performance.now();
randomTuples.forEach(([k, v]) => {
  hashMapTuple.set(k, v);
});
t1 = performance.now();
console.log('HashMap forEach set existing (tuples)', t1 - t0);

t0 = performance.now();
randomTuples.forEach(([k, v]) => {
  hashMapOrigTuple.set(k, v);
});
t1 = performance.now();
console.log('HashMapOrig forEach set existing (tuples)', t1 - t0);

t0 = performance.now();
randomObjects.forEach(([k, v]) => {
  hashMapObj.set(k, v);
});
t1 = performance.now();
console.log('HashMap forEach set existing (objects)', t1 - t0);

t0 = performance.now();
randomObjects.forEach(([k, v]) => {
  hashMapOrigObj.set(k, v);
});
t1 = performance.now();
console.log('HashMapOrig forEach set existing (objects)', t1 - t0);

console.log('');

let keys = map.keys().toArray();
t0 = performance.now();
keys.forEach(k => {
  map.delete(k);
});
t1 = performance.now();
console.log('Map forEach delete', t1 - t0);

keys = hashMap.keys().toArray();
t0 = performance.now();
keys.forEach(k => {
  hashMap.delete(k);
});
t1 = performance.now();
console.log('HashMap forEach delete', t1 - t0);

keys = hashMapOrig.keys().toArray();
t0 = performance.now();
keys.forEach(k => {
  hashMapOrig.delete(k);
});
t1 = performance.now();
console.log('HashMapOrig forEach delete', t1 - t0);

let keysT = hashMapTuple.keys().toArray();
t0 = performance.now();
keysT.forEach(k => {
  hashMapTuple.delete(k);
});
t1 = performance.now();
console.log('HashMap forEach delete (tuples)', t1 - t0);

keysT = hashMapOrigTuple.keys().toArray();
t0 = performance.now();
keysT.forEach(k => {
  hashMapOrigTuple.delete(k);
});
t1 = performance.now();
console.log('HashMapOrig forEach delete (tuples)', t1 - t0);

let keysO = hashMapObj.keys().toArray();
t0 = performance.now();
keysO.forEach(k => {
  hashMapObj.delete(k);
});
t1 = performance.now();
console.log('HashMap forEach delete (objects)', t1 - t0);

keysO = hashMapOrigObj.keys().toArray();
t0 = performance.now();
keysO.forEach(k => {
  hashMapOrigObj.delete(k);
});
t1 = performance.now();
console.log('HashMapOrig forEach delete (objects)', t1 - t0);

console.log('');

t0 = performance.now();
map = new Map();
randomNums.forEach(([k, v]) => {
  map.set(k, v);
});
t1 = performance.now();
console.log('Map forEach set', t1 - t0);

t0 = performance.now();
hashMap = new HashMap();
randomNums.forEach(([k, v]) => {
  hashMap.set(k, v);
});
t1 = performance.now();
console.log('HashMap forEach set', t1 - t0);

t0 = performance.now();
hashMapOrig = new HashMapOrig();
randomNums.forEach(([k, v]) => {
  hashMapOrig.set(k, v);
});
t1 = performance.now();
console.log('HashMapOrig forEach set', t1 - t0);

t0 = performance.now();
hashMapTuple = new HashMap();
randomTuples.forEach(([k, v]) => {
  hashMapTuple.set(k, v);
});
t1 = performance.now();
console.log('HashMap forEach set (tuples)', t1 - t0);

t0 = performance.now();
hashMapOrigTuple = new HashMapOrig();
randomTuples.forEach(([k, v]) => {
  hashMapOrigTuple.set(k, v);
});
t1 = performance.now();
console.log('HashMapOrig forEach set (tuples)', t1 - t0);

t0 = performance.now();
hashMapObj = new HashMap();
randomObjects.forEach(([k, v]) => {
  hashMapObj.set(k, v);
});
t1 = performance.now();
console.log('HashMap forEach set (objects)', t1 - t0);

t0 = performance.now();
hashMapOrigObj = new HashMapOrig();
randomObjects.forEach(([k, v]) => {
  hashMapOrigObj.set(k, v);
});
t1 = performance.now();
console.log('HashMapOrig forEach set (objects)', t1 - t0);
