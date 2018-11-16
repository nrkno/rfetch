// const tweakDefault = require('./build/rollup-plugin')
import buble from 'rollup-plugin-buble'
import { uglify } from 'rollup-plugin-uglify'

/*
  options.format = [system, amd, cjs, es, iife, umd],
  options.exports = [ 'default', 'named', 'none', 'auto'], default 'auto'
*/
export default [
  // fetch with retry node impl
  {
    input: './rollup/fetch-with-retry-node.rollup.js',
    output: [
      { file: 'impl/node/index.js', format: 'cjs', exports: 'named', interop: false, strict: false },
      { file: 'impl/node/index.mjs', format: 'es', exports: 'named' }
    ],
    preferConst: true,
    external: ['abort-controller', 'node-fetch']
  },
  // fetch with retry window impl

  {
    input: './rollup/fetch-with-retry-window.rollup.js',
    output: [

      { file: 'impl/window/index.js', format: 'cjs', exports: 'named', interop: false, strict: false },
      { file: 'impl/window/index.mjs', format: 'es', exports: 'named' }
    ],
    preferConst: true,
    external: ['abort-controller', 'whatwg-fetch', 'es6-promise']
  },
  // fetch with retry browser dist
  {
    input: './rollup/fetch-with-retry-browser.rollup.js',
    output: [
      {
        file: 'dist/fetchWithRetry.min.js',
        format: 'umd',
        exports: 'default',
        name: 'fetchWithRetry',
        sourcemap: true,
        globals: {
          'abort-controller': 'AbortController',
          'whatwg-fetch': 'fetch',
          'es6-promise': 'Promise'
        }
      }
    ],
    external: ['abort-controller', 'whatwg-fetch', 'es6-promise'],
    plugins: [
      buble(
        {
          transforms: { dangerousForOf: true }
        }
      ),
      uglify()
    ]

  }
]
