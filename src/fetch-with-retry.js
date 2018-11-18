import FetchWithRetryError from './fetch-with-retry-error.js'
import SignalTimeoutContext from './signal-timeout-context.js'
import RetryOptions from './retry-options.js'
import fetchImpl from './fetch-impl.js'
import psleep from './util/psleep.js'
import includes from './util/includes.js'

function fetchWithRetryLoopAttempt (url, options, retryOptions, ctx) {
  const {
    signalTimeout,
    statusCodes,
    maxRetries,
    retryStatusCodes
  } = retryOptions

  const signalTimeoutContext =
    SignalTimeoutContext.create(signalTimeout, url)

  options.signal = signalTimeoutContext.signal

  return fetchImpl.fetch(url, options)
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

      psleep(retryTimeout)
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
 * @param {RetryOptions} retryOptions
 * @returns {Promise<any>}
 */
function fetchWithRetry (url, options = null, retryOptions = null) {
  return new Promise((resolve, reject) => (
    fetchWithRetryLoop(
      url,
      options,
      RetryOptions.parse(retryOptions),
      { resolve, reject, n: 0 }
    )
  ))
}

export default fetchWithRetry
