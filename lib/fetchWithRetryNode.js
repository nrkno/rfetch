const sleep = require('sleep')

/**
 * @async
 * @param {string} url
 * @param {Object} options
 * @param {Number} maxRetry
 * @param {Number} timeout
 * @returns {Promise<Object>}
 */
async function fetchWithRetryNode (url, options, maxRetry = 3, timeout = 100) {
  for (let i = 0; i < maxRetry; i++) {
    try {
      return await fetch(url, options)
    } catch (e) {
      if (i + 1 === maxRetry) {
        throw e
      }
      await sleep(timeout)
    }
  }
}

module.exports = fetchWithRetryNode
