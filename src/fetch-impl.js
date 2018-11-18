/* global window, fetch */
import env from './util/env.js'

const functions = {}
functions.fetchImpl = null

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
