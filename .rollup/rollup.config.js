// import commonjs from 'rollup-plugin-commonjs'
// import json from 'rollup-plugin-json'
// import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import buble from 'rollup-plugin-buble'
import { uglify } from 'rollup-plugin-uglify'
import cleanup from 'rollup-plugin-cleanup'
import replace from 'rollup-plugin-replace'

/*
  options.format = [system, amd, cjs, es, iife, umd],
  options.exports = [ 'default', 'named', 'none', 'auto'], default 'auto'
*/
export default [
  /* build dist/fetchWithRetry.min.js and sourcemap entry */
  {
    input: '.rollup/dist-export.js',
    output: [
      {
        file: 'dist/fetch-with-retry.min.js',
        format: 'umd',
        exports: 'default',
        name: 'fetchWithRetry',
        sourcemap: true,
        globals: {
          'abort-controller': 'AbortController'
        }
      }
    ],
    external: ['abort-controller'],
    plugins: [
      replace({
        'process.browser': true
      }),
      buble(
        {
          transforms: { dangerousForOf: true }
        }
      ),
      babel({
        exclude: 'node_modules/**',
        plugins: [
          'babel-plugin-async-to-promises'
        ]
      })
    ]
  },

  /* build lib/index.{js|mjs} files entry */
  {
    input: '.rollup/lib-export.js',
    output: [

      { file: 'lib/index.js', format: 'cjs', exports: 'default', strict: false },
      { file: 'lib/index.mjs', format: 'es', exports: 'named' }
    ],
    preferConst: true,
    external: ['abort-controller', 'node-fetch'],
    plugins: [
      replace({
        'process.browser': false
      }),
      cleanup({
        // set max empty lines to 1
        maxEmptyLines: 1,
        // keep jsdoc comments
        comments: ['jsdoc']
      })
    ]
  }
]
