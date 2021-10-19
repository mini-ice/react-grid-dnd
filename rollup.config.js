import typescript from 'rollup-plugin-typescript2';
import eslint from '@rollup/plugin-eslint';
import alias from '@rollup/plugin-alias';
import path from 'path';
import pkg from './package.json';

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
];

const plugins = [
  eslint({ include: ['src/**/*', 'stories/**/*'], exclude: ['node_modules'] }),
  alias({ entries: [{ find: '@', replacement: path.resolve(__dirname, './src') }] }),
  typescript(),
];

export default {
  input: 'src/index.ts',
  output: [
    { file: 'esm/index.js', format: 'esm' },
    { file: 'cjs/index.js', format: 'cjs' },
  ],
  external,
  plugins,
};
