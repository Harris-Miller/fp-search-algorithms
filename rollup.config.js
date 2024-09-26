import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

/** @type {(format: 'esm' | 'cjs') => import('rollup').OutputOptions} */
const output = format => {
  const extension = format === 'esm' ? '.js' : '.cjs';
  return {
    dir: './dist',
    entryFileNames: `[name]${extension}`,
    esModule: format !== 'esm',
    format,
    sourcemap: true,
  };
};

/** @type {import('rollup').RollupOptions} */
const rollupConfig = {
  external: /node_modules/,
  input: {
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
