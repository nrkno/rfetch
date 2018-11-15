const sleep = require('sleep')

const defaultRetryOptions = {
  maxRetry: 3,
  timeout: 100,
  statusCodes: [] // The status code
}

function parseNumber (value) {
  if (!value) {
    return null
  }

  return parseInt(Number(value))
}

function parseRetryOptions (params) {
  if (!params) {
    return defaultRetryOptions
  }

  const options = {}
  for (const key of ['maxRetry', 'timeout']) {
    const value = parseNumber(params[key]) || defaultRetryOptions[key]
    options[key] = value
  }



  return options
}


/**
 * @async
 * @param {string} url
 * @param {Object} options
 * @param {Number} maxRetry
 * @param {Number} timeout
 * @returns {Promise<Object>}
 */
async function fetchWithRetryNode (url, options, retryOptions = { maxRetry: 3, timeout: 100, statusCodes: []}) {
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
