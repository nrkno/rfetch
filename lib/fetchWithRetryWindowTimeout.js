/* global fetch */
const sleep = require('sleep')
const createFetchAbortController = require('createFetchAbortController')

function fetchWithRetryWindowTimeoutN (url, options, timeout = 100) {
  return new Promise ((resolve, reject) => {
    let fetchAbortController
    if (options.timeout) {
      fetchAbortController = createFetchAbortController(options.timeout)
      options.signal = fetchAbortController.controller.signal
    }

    fetch(url, options)
      .then(response => {
        if (fetchAbortController) {
          fetchAbortController.completed = true
        }
        resolve(response)
      })
      .catch(response => {
        if (fetchAbortController) {
          fetchAbortController.completed = true
        }
        reject(response)
      })
  })
}

function fetchWithRetryWindowTimeout (url, options, maxRetry = 3, timeout = 100) {
  return new Promise ((resolve, reject) => {
    const loop = (i) => {
      fetchWithRetryWindowTimeoutN(url, options, timeout)
        .then(resolve)
        .catch(e => {
          if (n + 1 === maxRetry) {
            reject(e)
            return
          }

          loop(i + 1)
        })
    }

    loop(0)
  })
}

module.exports = fetchWithRetryWindowTimeout
