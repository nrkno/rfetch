import buble from 'rollup-plugin-buble'
import cleanup from 'rollup-plugin-cleanup'
import replace from 'rollup-plugin-replace'
import { uglify } from 'rollup-plugin-uglify'

/*
  options.format = [system, amd, cjs, es, iife, umd],
  options.exports = [ 'default', 'named', 'none', 'auto'], default 'auto'
  options.treeshake.pureExternalModules = true, prunes unused imports in the web target

  For browser and node targets @see:

  - https://github.com/defunctzombie/package-browser-field-spec
  - https://github.com/visionmedia/superagent/blob/master/package.json#L56
*/
export default [
  /* build dist/fetchWithRetry.min.js and sourcemap entry */
  {
    input: '.rollup/rfetch-web-export.js',
    output: [
      {
        file: 'dist/rfetch.web.min.js',
        format: 'umd',
        exports: 'default',
        name: 'rfetch',
        sourcemap: true,
        globals: {
          'abort-controller': 'AbortController',
          'node-fetch': 'fetch'
        }
      }
    ],
    external: ['abort-controller', 'node-fetch'],
    treeshake: {
      pureExternalModules: true
    },
    plugins: [
      replace({
        'process.env.rollupTargetWeb': true
      }),
      buble(
        {
          transforms: { dangerousForOf: true }
        }
      ),
      uglify()
    ]
  },

  /* build lib/index.{js|mjs} files entry node target */
  {
    input: '.rollup/rfetch-export.js',
    output: [

      { file: 'lib/rfetch.js', format: 'cjs', exports: 'default', strict: false },
      { file: 'lib/rfetch.mjs', format: 'es', exports: 'named' }
    ],
    preferConst: true,
    external: ['abort-controller', 'node-fetch'],
    plugins: [
      replace({
        'process.env.rollupTargetWeb': false
      }),
      cleanup({
        // set max empty lines to 1
        maxEmptyLines: 1,
        // keep jsdoc comments
        comments: ['jsdoc']
      })
    ]
  },

  /* build lib/index.{js|mjs} files entry web target */
  {
    input: '.rollup/rfetch-web-export.js',
    output: [

      { file: 'lib/rfetch.web.js', format: 'cjs', exports: 'default', strict: false },
      { file: 'lib/rfetch.web.mjs', format: 'es', exports: 'named' }
    ],
    preferConst: true,
    treeshake: {
      pureExternalModules: true
    },
    external: ['abort-controller', 'node-fetch'],
    plugins: [
      replace({
        'process.env.rollupTargetWeb': true
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
