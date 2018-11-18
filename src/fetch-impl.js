/* global window, fetch */
import env from './util/env.js'

const functions = {}
functions.fetchImpl = null

/*
  Selection of fetch implementation heuristics:
  ---------------------------------------------
  1. env.browser = true, when compiled for browser umd version the rest of the if/else block is erased
  2. env.process = true no global.fetch = undefined (no polyfill has been set) we use the `node-fetch` library
  3. finally fallback to the global.fetch pollyfill
*/
if (env.browser) {
  functions.fetchImpl = fetch.bind()
} else if (env.process && !global.fetch) {
  functions.fetchImpl = require('node-fetch')
} else {
  functions.fetchImpl = global.fetch.bind()
}

/**
 * @param {String} url
 * @param {Object} options
 */
function fetchProxy (url, options) {
  return functions.fetchImpl(url, options)
}

export default {
  functions,
  fetch: fetchProxy
}
