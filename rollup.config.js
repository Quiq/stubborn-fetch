import babel from 'rollup-plugin-babel';
import flow from 'rollup-plugin-flow';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index-cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/index-es.js',
      format: 'es',
    },
  ],
  plugins: [
    flow({all: true, pretty: true}),
    resolve({
      jsnext: true,
    }),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
    }),
  ],
};
