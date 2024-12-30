/* eslint-disable @typescript-eslint/prefer-return-this-type */
import { isEqual } from '../helpers/isEqual';

import { HashSet } from './hashSet';

/**
 * Tuple representing an Edge between to Vertices
 *
 * @public
 * @category Structures
 */
export type Edge<V> = [from: V, to: V];

/**
 * pruneShortPath (evaluate conditions on path)
 * Returns `true` if path is too short, `false` otherwise
 */
const pruneShortPath = (counter: number, min: number): boolean => counter < min;

/**
 * Port of Erlang's digraph
 * WIP
 *
 * @public
 * @category Structures
 */
export class DirectedGraph<V, L = unknown> {
  private cyclical: boolean;

  private vertices = new HashSet<V>();

  private edges = new HashSet<Edge<V>>();

  constructor(options: { cyclical?: boolean } = {}) {
    this.cyclical = options.cyclical ?? false;
  }

  /**
   * @group Vertices
   */
  addVertex(vertex: V): DirectedGraph<V, L> {
    this.vertices.add(vertex);
    return this;
  }

  /**
   * @group Vertices
   */
  deleteVertex(vertex: V): boolean {
    const deleted = this.vertices.delete(vertex);
    if (deleted) {
      this.edges = this.edges.filter(([from, to]) => !isEqual(from, vertex) && !isEqual(to, vertex));
    }
    return deleted;
  }

  /**
   * @group Vertices
   */
  deleteVertices(vertices: V[]): boolean[] {
    const deleted = vertices.map(v => this.vertices.delete(v));
    const hs = new HashSet<V>(vertices);
    this.edges = this.edges.filter(([from, to]) => !hs.has(from) && !hs.has(to));
    return deleted;
  }

  private inEdgesIterator(vertex: V) {
    return this.edges.values().filter(([, to]) => isEqual(to, vertex));
  }

  private outEdgesIterator(vertex: V) {
    return this.edges.values().filter(([from]) => isEqual(from, vertex));
  }

  private edgesIterator(vertex: V) {
    return this.edges.values().filter(([from, to]) => isEqual(from, vertex) || isEqual(to, vertex));
  }

  /**
   * Return all edges fora given vertex in an unspecified order
   *
   * @group Vertices
   * */
  getEdges(vertex: V): Edge<V>[] {
    return Array.from(this.edgesIterator(vertex));
  }

  /**
   * @group Vertices
   */
  inDegree(vertex: V): number {
    return Array.from(this.inEdgesIterator(vertex)).length;
  }

  /**
   * @group Vertices
   */
  outDegree(vertex: V): number {
    return Array.from(this.outEdgesIterator(vertex)).length;
  }

  /**
   * @group Vertices
   */
  inNeighbors(vertex: V): V[] {
    return Array.from(this.inEdgesIterator(vertex).map(([from]) => from));
  }

  /**
   * @group Vertices
   */
  outNeighbors(vertex: V): V[] {
    return Array.from(this.outEdgesIterator(vertex).map(([, to]) => to));
  }

  /**
   * @group Edges
   */
  addEdge(from: V, to: V) {
    this.edges.add([from, to]);
    return this;
  }

  /**
   * @group Edges
   */
  deleteEdge(edge: Edge<V>): boolean {
    return this.edges.delete(edge);
  }

  /**
   * @group Edges
   */
  deleteEdges(edges: Edge<V>[]): boolean[] {
    return edges.map(tuple => this.edges.delete(tuple));
  }

  /**
   * @group Edges
   */
  inEdges(vertex: V): Edge<V>[] {
    return Array.from(this.inEdgesIterator(vertex));
  }

  /**
   * @group Edges
   */
  outEdges(vertex: V): Edge<V>[] {
    return Array.from(this.outEdgesIterator(vertex));
  }

  //
  // Helpers
  //

  /** return all vertices */
  // getVertices(): Edge<V>[] {
  //   return Array.from(this.edgesIterator(vertex));
  // }

  /**
   * Returns number of vertices
   *
   * @group Helpers
   */
  numVertices(): number {
    return this.vertices.size;
  }

  /**
   * Returns number of edges
   *
   * @group Helpers
   */
  numEdges(): number {
    return this.edges.size;
  }

  /**
   * If a simple cycle of length two or more exists through a vertex, the cycle is returned as a list [V, ..., V] of vertices.
   * If a loop through the vertex exists, the loop is returned as a list [V]. If no cycles exist, undefined is returned.
   *
   * @group Advanced
   */
  getCycle(vertex: V): V[] | undefined {
    if (this.outNeighbors(vertex).includes(vertex)) return [vertex];
    return this.onePath(this.outNeighbors(vertex), vertex, [], new HashSet<V>([vertex]), [vertex], 2, 1);
  }

  /**
   * Tries to find an as short as possible simple cycle through a vertex.
   * Returns the cycle as a list [V, ..., V] of vertices, or undefined if no simple cycle exists.
   * Notice that a loop through the vertex is returned as list [V, V].
   *
   * @group Advanced
   */
  getShortCycle(vertex: V): V[] | undefined {
    return this.getShortPath(vertex, vertex);
  }

  /**
   * @group Advanced
   */
  getPath(from: V, to: V): V[] | undefined {
    return this.onePath(this.outNeighbors(from), to, [], new HashSet<V>([from]), [from], 1, 1);
  }

  /**
   * @group Advanced
   */
  getShortPath(from: V, to: V): V[] | undefined {
    const tempGraph = new DirectedGraph<V>().addVertex(from);
    const queue = this.outEdges(from);
    return this.shortPath(queue, to, tempGraph);
  }

  /**
   * Delete all paths found between two vertices.
   * Returns false if not paths found, otherwise returns true
   *
   * @group Advanced
   */
  deletePath(from: V, to: V): boolean {
    let path = this.getPath(from, to);
    if (path === undefined) return false;
    while (path !== undefined) {
      while (path.length > 1) {
        const v1 = path.shift()!;
        const [v2] = path;
        this.deleteEdge([v1, v2]);
      }
      path = this.getPath(from, to);
    }
    return true;
  }

  /**
   * @group Advanced
   */
  components(): V[][] {
    throw new Error('DirectedGraph#components :: Not yet implemented');
  }

  /**
   * Returns true if and only if the DirectedGraph is acyclic.
   *
   * @group Advanced
   */
  isAcyclic(): boolean {
    throw new Error('DirectedGraph#isAcyclic :: Not yet implemented');
  }

  /**
   * Returns true if and only if the DirectedGraph is a tree.
   *
   * @group Advanced
   */
  isTree(): boolean {
    throw new Error('DirectedGraph#isTree :: Not yet implemented');
  }

  /**
   * @group Advanced
   */
  reachable(vertices: V[]): V[] {
    return this.postGenerate(vertices, false).toArray();
  }

  /**
   * @group Advanced
   */
  reachableNeighbors(vertices: V[]): V[] {
    return this.postGenerate(vertices, true).toArray();
  }

  /**
   * @group Advanced
   */
  postOrder(): V[] {
    return this.postGenerate([...this.vertices], false).toArray();
  }

  /**
   * @group Advanced
   */
  preOrder(): V[] {
    throw new Error('DirectedGraph#preOrder :: Not yet implemented');
  }

  /**
   * @group Advanced
   */
  topsort(): V[] {
    throw new Error('DirectedGraph#topsort :: Not yet implemented');
  }

  //
  // Private
  //

  /**
   * TODO: find a better name
   * TODO: look into optimizing this for javascript
   */
  private onePath(
    vertices: V[],
    target: V,
    cont: [vertices: V[], path: V[]][],
    visited: HashSet<V>,
    path: V[],
    minPathLength: number,
    counter: number,
  ): V[] | undefined {
    if (vertices.length === 0) {
      if (cont.length === 0) return undefined;
      const [vertices2, path2] = cont.pop()!;
      return this.onePath(vertices2, target, cont, visited, path2, minPathLength, counter - 1);
    }

    const [vertex, ...remaining] = vertices;

    if (isEqual(vertex, target)) {
      if (pruneShortPath(counter, minPathLength)) {
        return this.onePath(remaining, target, cont, visited, path, minPathLength, counter);
      }

      return [...path, vertex];
    }

    if (visited.has(vertex)) {
      return this.onePath(remaining, target, cont, visited, path, minPathLength, counter);
    }

    return this.onePath(
      this.outNeighbors(vertex),
      target,
      [...cont, [remaining, path]],
      visited.add(vertex),
      [...path, vertex],
      minPathLength,
      counter + 1,
    );
  }

  private shortPath(queue: Edge<V>[], target: V, tempGraph: DirectedGraph<V>): V[] | undefined {
    while (queue.length !== 0) {
      const [from, to] = queue.shift()!;
      if (isEqual(to, target)) {
        return this.followPath(from, tempGraph, [to]);
      }

      if (tempGraph.vertices.has(to)) {
        continue;
      }

      tempGraph.addVertex(to);
      tempGraph.addEdge(to, from);
      queue.push(...this.outEdges(to));
    }

    return undefined;
  }

  private followPath(vertex: V, tempGraph: DirectedGraph<V>, path: V[]): V[] {
    path.unshift(vertex);
    let ns = tempGraph.outNeighbors(vertex);
    while (ns.length !== 0) {
      // add first neighbor only
      path.unshift(ns[0]);
      // get that neighbor's neighbors
      ns = tempGraph.outNeighbors(ns[0]);
    }
    return path;
  }

  private *postGenerate(startingVertices: V[], excludeStartingVertices: boolean) {
    const visited = new HashSet<V>();
    // start reversed since we're popping off the end
    const stack: V[] = startingVertices.toReversed();

    while (stack.length) {
      const current = stack.pop()!;
      if (!visited.has(current)) {
        if (excludeStartingVertices) {
          if (startingVertices.findIndex(v => isEqual(v, current)) === -1) {
            yield current;
          }
        } else {
          yield current;
        }
        visited.add(current);
        stack.push(...this.outNeighbors(current).reverse());
      }
    }
  }
}
