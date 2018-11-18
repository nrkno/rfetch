/* global window */
import env from './util/env.js'

const context = env.global && env.process
  ? global
  : window

const fetchImpl = env.browser
  ? context.fetch
  : require('node-fetch')

/**
 * @param {String} url
 * @param {Object} options
 */
function fetch (url, options) {
  return fetchImpl(url, options)
}

const functions = {
  fetch
}

export default {
  functions,
  fetch
}
