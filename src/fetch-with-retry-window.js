/* global window */
import AbortController from 'abort-controller'
import { fetch } from 'whatwg-fetch'
import { Promise } from 'es6-promise'

import FetchWithRetryError from './fetch-with-retry-error.js'
import retryOptionsParser from './retry-options-parser.js'
import sleep from './sleep.js'

const _setImmediate = window.setImmediate
  ? window.setImmediate
  : (cb) => setTimeout(cb, 0)

function createSignalTimeoutContext (signalTimeout) {
  const controller = new AbortController()
  const context = {
    signal: controller.signal,
    signalTimeoutDispatch: true
  }

  context.signal = controller.signal
  context.signalTimeoutDispatch = true

  _setImmediate(() => {
    sleep(signalTimeout)
      .then(() => {
        if (context.signalTimeoutDispatch) {
          controller.abort()
        }
      })
  })

  return context
}

function includes (list, value) {
  return list.indexOf(value) >= 0
}

/* used for test spies */
const fetchProxy = {
  fetch (url, options) {
    return fetch(url, options)
  }
}

function fetchWithRetryLoopAttempt (url, options, retryOptions, ctx) {
  const {
    signalTimeout,
    statusCodes,
    maxRetries,
    retryStatusCodes
  } = retryOptions

  const signalTimeoutContext =
    createSignalTimeoutContext(signalTimeout, url)

  options.signal = signalTimeoutContext.signal

  return fetchProxy.fetch(url, options)
    .then(response => {
      signalTimeoutContext.signalTimeoutDispatch = false
      if (statusCodes.includes(response.status)) {
        return response
      }

      if (retryStatusCodes.length && !includes(retryStatusCodes, response.status)) {
        const message =
          `Response.status: <${response.status}>, ` +
          `is not retryStatusCodes: <[${retryStatusCodes.join(', ')}]> ` +
          `attempt: <${ctx.n + 1}>, willRetry: <false>.`

        // increment n so that we don't retry
        ctx.n = maxRetries - 1
        throw new FetchWithRetryError(message)
      }

      if (retryStatusCodes.length && includes(retryStatusCodes, response.status)) {
        throw new FetchWithRetryError(
          `Response.status: <${response.status}>, ` +
          `is in retryStatusCodes: <[${retryStatusCodes.join(', ')}]> ` +
          `attempt: <${ctx.n + 1}>, willRetry: <${String(ctx.n + 1 < maxRetries)}>.`
        )
      }

      throw new FetchWithRetryError(
        `Response.status: <${response.status}>, ` +
        `not in expected statusCodes: <[${statusCodes.join(', ')}]> ` +
        `attempt: <${ctx.n + 1}>, willRetry: <${String(ctx.n + 1 < maxRetries)}>.`
      )
    })
}

function fetchWithRetryLoop (url, options, retryOptions, promise, n = 0) {
  const {
    maxRetries,
    retryTimeout,
    errors
  } = retryOptions

  const ctx = { n }

  fetchWithRetryLoopAttempt(url, options, retryOptions, ctx)
    .then(promise.resolve)
    .catch(err => {
      errors.push(err)
      if (ctx.n + 1 === maxRetries) {
        promise.reject(err)
        return
      }

      sleep(retryTimeout)
        .then(() => {
          fetchWithRetryLoop(url, options, retryOptions, promise, ctx.n + 1)
        })
    })
}

/**
 * Fetch with retry
 *
 * @param {String} url
 * @param {Object} options @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
 * @param {*} retryOptions
 * @returns {Promise<any}
 */
function fetchWithRetry (url, options = null, retryOptions = null) {
  return new Promise((resolve, reject) => (
    fetchWithRetryLoop(
      url,
      options,
      retryOptionsParser.parse(retryOptions),
      { resolve, reject, n: 0 }
    )
  ))
}

/* es6 module export (used internally) */
export default fetchWithRetry

/* umd exports */
export {
  createSignalTimeoutContext,
  fetchProxy,
  fetchWithRetry
}
