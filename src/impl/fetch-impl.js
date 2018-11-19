/* global window */
import nodeFetch from 'node-fetch'

const definitions = {}

/*
  Roll up target is web, use window.fetch,
  otherwise use fetch from the `node-fetch` library
*/
definitions.fetch = process.env.rollupTargetWeb
  ? window.fetch.bind()
  : nodeFetch

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
