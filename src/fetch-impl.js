/* global window, fetch */
import env from './util/env.js'
import nodeFetch from 'node-fetch'

const definitions = {}

/*
  Selection of fetch implementation heuristics:
  ---------------------------------------------
  1. env.browser = true, when compiled for browser umd version the rest of the if/else block is erased
  2. env.process = true no global.fetch = undefined (no polyfill has been set) we use the `node-fetch` library
  3. finally fallback to the global.fetch pollyfill
*/
if (env.browser) {
  definitions.fetch = fetch.bind()
} else if (env.process && !global.fetch) {
  definitions.fetch = nodeFetch
} else {
  definitions.fetch = global.fetch.bind()
}

export default {
  definitions,

  /**
   * @param {String} url
   * @param {Object} options
   */
  fetch (url, options) {
    return definitions.fetch(url, options)
  }
}
