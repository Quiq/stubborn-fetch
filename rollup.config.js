import babel from 'rollup-plugin-babel';
import flow from 'rollup-plugin-flow';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  plugins: [
    flow({all: true, pretty: true}),
    resolve({
      jsnext: true,
      preferBuiltins: true,
      browser: true,
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    commonjs(),
  ],
  moduleContext: {
    [require.resolve('whatwg-fetch')]: 'window',
  },
};
