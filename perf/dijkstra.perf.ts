/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-plusplus */
import * as R from 'ramda';

import { isEqual } from '../src/helpers/isEqual';
import { always, getNeighbors4, makeGrid } from '../src/searches/__tests__/utils';
import type { Point } from '../src/searches/__tests__/utils';
import { dijkstra } from '../src/searches/dijkstra';
import { HashSet } from '../src/structures/hashSet';

import { maximum, minimum } from './helpers';
import { dijkstra as dijkstraOrig } from './originals/dijkstra.orig';

// Testing my original Dijkstra algorithm versus the new one that simply utilizes AStar
// oddly enough, the AStar one seems to be a bit faster, but it's pretty negligible, milliseconds difference

const url = new URL('../src/searches/__tests__/cheeseSearch.txt', import.meta.url);
const contents = await Bun.file(url).text();
const grid = makeGrid(contents);
const walls = new HashSet(
  grid
    .entries()
    .filter(([, v]) => v === '#')
    .map(([k]) => k),
);
const [start, end] = grid
  .entries()
  .filter(([, v]) => v === '0' || v === '7')
  .map(([k]) => k);

const next = (p: Point) => getNeighbors4(p).filter(x => !walls.has(x));
const found = (p: Point) => isEqual(p, end);

const doResults: number[] = [];
const dResults: number[] = [];

for (let i = 0; i < 1000; ++i) {
  const t0 = performance.now();
  const _result = dijkstra(next, always(1), found, start)!;
  const t1 = performance.now();
  dResults.push(t1 - t0);
}

for (let i = 0; i < 1000; ++i) {
  const t0 = performance.now();
  const _result = dijkstraOrig(next, always(1), found, start)!;
  const t1 = performance.now();
  doResults.push(t1 - t0);
}

console.log('Dijkstra Original');
console.log('lowest', minimum(doResults));
console.log('highest', maximum(doResults));
console.log('average', R.sum(doResults) / doResults.length);
console.log('mean', R.mean(doResults));
console.log('median', R.median(doResults));

console.log('');

console.log('Dijkstra using AStar');
console.log('lowest', minimum(dResults));
console.log('highest', maximum(dResults));
console.log('average', R.sum(dResults) / dResults.length);
console.log('mean', R.mean(dResults));
console.log('median', R.median(dResults));
