import typescript from 'rollup-plugin-typescript2';
// import eslint from '@rollup/plugin-eslint';
import filesize from 'rollup-plugin-filesize';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import path from 'path';
import tsconfig from './tsconfig.build.json';
import pkg from './package.json';

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
];

const plugins = [
  alias({ entries: [{ find: '@', replacement: path.resolve(__dirname, './src') }] }),
  // eslint({ include: ['src/**/*', 'stories/**/*'], exclude: ['node_modules'] }),
  commonjs(),
  typescript({
    tsconfigOverride: {
      exclude: tsconfig.exclude,
    },
  }),
  filesize(),
];

export default {
  input: 'src/index.ts',
  output: [
    { file: 'cjs/index.js', format: 'cjs' },
    {
      file: 'umd/react-dnd-gird.js',
      format: 'umd',
      name: 'ReactDndGrid',
      globals: { react: 'React', 'react-dom': 'ReactDOM' },
    },
  ],
  external,
  plugins,
};
