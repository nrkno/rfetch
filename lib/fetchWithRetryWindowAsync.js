/* global fetch */
const sleep = require('sleep')
const createFetchAbortController = require('createFetchAbortController')

async function fetchWithRetryWindowAsync (url, options, maxRetry = 3, timeout = 100) {
  for (let i = 0; i < maxRetry; i++) {
    let fetchAbortController
    if (options.timeout) {
      fetchAbortController = createFetchAbortController(options.timeout)
      options.signal = fetchAbortController.controller.signal
    }

    try {
      const response = await fetch(url, options)
      if (fetchAbortController) {
        fetchAbortController.completed = true
      }

      return response
    } catch (e) {
      if (fetchAbortController) {
        fetchAbortController.completed = true
      }

      if (i + 1 === maxRetry) {
        throw e
      }
      await sleep(timeout)
    }
  }
}


module.exports = fetchWithRetryWindowAsync
