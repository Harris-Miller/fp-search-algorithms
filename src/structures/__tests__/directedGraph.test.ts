import { describe, expect, it } from 'bun:test';

import { DirectedGraph } from '../directedGraph';

const createStandardGraph = () =>
  new DirectedGraph<string>()
    .addVertex('s')
    .addVertex('a')
    .addVertex('b')
    .addVertex('m')
    .addVertex('n')
    .addVertex('x')
    .addVertex('y')
    .addVertex('e')
    .addEdge('s', 'a')
    .addEdge('a', 'b')
    .addEdge('b', 'e')
    .addEdge('s', 'm')
    .addEdge('m', 'n')
    .addEdge('n', 'e')
    .addEdge('s', 'x')
    .addEdge('x', 'y')
    .addEdge('y', 'e');

describe('class DirectedGraph', () => {
  describe('method outNeighbors', () => {
    it('returns list of vertexes in edges that emanate from a given vertex', () => {
      const graph = createStandardGraph();
      const neighbors = graph.outNeighbors('s');
      expect(neighbors).toContainAllValues(['a', 'm', 'x']);
    });
  });

  describe('method getPath', () => {
    it('finds path', () => {
      const graph = createStandardGraph();
      const path = graph.getPath('s', 'e');
      // which of the possible paths are arbitrary based on iteration order of edges
      // this happens to be the correct output for how createStandardGraph() is built
      expect(path).toEqual(['s', 'x', 'y', 'e']);
    });
  });

  describe('method getShortPath', () => {
    it('finds path', () => {
      const graph = createStandardGraph();
      graph.deleteEdge(['a', 'b']);
      graph.addEdge('a', 'e');

      const path = graph.getShortPath('s', 'e');
      // this should always be the expected shorted-path found because of how the graph is altered for this test
      expect(path).toEqual(['s', 'a', 'e']);
    });
  });

  describe('method deletePath', () => {
    it('removes all paths', () => {
      const graph = createStandardGraph();

      graph.deletePath('s', 'e');

      expect(graph.numEdges()).toBe(0);
    });
  });

  it('method postOrder', () => {
    const graph = createStandardGraph();
    expect(graph.postOrder()).toEqual(['a', 'b', 'e', 'm', 'n', 's', 'x', 'y']);
  });

  it('method reachable', () => {
    const graph = createStandardGraph();
    expect(graph.reachable(['y'])).toEqual(['y', 'e']);
  });

  it('method reachableNeighbors', () => {
    const graph = createStandardGraph();
    expect(graph.reachableNeighbors(['y'])).toEqual(['e']);
  });
});
