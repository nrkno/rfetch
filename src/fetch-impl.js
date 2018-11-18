/* global window */
import env from './util/env.js'

const functions = {}
functions.fetchImpl = null

if (env.browser) {
  functions.fetchImpl = window.fetch
} else if (env.process && !global.fetch) {
  functions.fetchImpl = require('node-fetch')
} else {
  functions.fetchImpl = global.fetch
}

/**
 * @param {String} url
 * @param {Object} options
 */
function fetch (url, options) {
  return functions.fetchImpl(url, options)
}

export default {
  functions,
  fetch
}
