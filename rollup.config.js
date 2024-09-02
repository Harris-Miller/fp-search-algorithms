import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

/** @type {(format: 'esm' | 'cjs') => import('rollup').OutputOptions} */
const output = format => {
  const extension = format === 'esm' ? '.js' : '.cjs';
  return {
    chunkFileNames: `[name]${extension}`,
    dir: './dist',
    entryFileNames: `[name]${extension}`,
    esModule: format !== 'esm',
    exports: 'named',
    format,
    sourcemap: true,
  };
};

/** @type {import('rollup').RollupOptions} */
const rollupConfig = {
  external: /node_modules/,
  input: {
    aStar: 'src/aStar/aStar.ts',
    breadthFirst: 'src/breadthFirst/breadthFirst.ts',
    depthFirst: 'src/depthFirst/depthFirst.ts',
    dijkstra: 'src/dijkstra/dijkstra.ts',
    index: 'src/index.ts',
  },
  output: [output('esm'), output('cjs')],
  plugins: [
    nodeResolve(),
    typescript({
      composite: false,
      outDir: 'dist',
      rootDir: 'src',
      tsconfig: 'tsconfig.build.json',
    }),
  ],
};

// eslint-disable-next-line import/no-default-export
export default rollupConfig;
