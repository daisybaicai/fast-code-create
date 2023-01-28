import rollupResolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';

export default {
  input: 'src/extension.js',
  output: [
    { file: 'dist/index.js', format: 'cjs' },
  ],
  external: ['prettier','@babel/traverse','@babel/types','@babel/generator','@babel/template','@babel/traverse'],
  watch: {
    include: 'src/**',
  },
  plugins: [
    json(),
    commonjs(),
    rollupResolve(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js'],
      exclude: /node_modules|babel/,
      presets: [
        [
          '@babel/preset-env',
          {
            // targets: 'iOS 9, Android 4.4, last 2 versions, > 0.2%, not dead',
            modules: false,
          },
        ],
      ],
    }),
    // ya suo
    // terser(),
  ],
};