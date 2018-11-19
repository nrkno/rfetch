import buble from 'rollup-plugin-buble'
import cleanup from 'rollup-plugin-cleanup'
import replace from 'rollup-plugin-replace'
import { uglify } from 'rollup-plugin-uglify'

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
        file: 'dist/rfetch.min.js',
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
      uglify()
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
