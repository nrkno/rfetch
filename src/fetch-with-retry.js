import FetchWithRetryError from './fetch-with-retry-error.js'
import SignalTimeoutContext from './signal-timeout-context'
import fetchProxy from './fetch-proxy'

import retryOptionsParser from './retry-options-parser.js'
import sleep from './util/sleep.js'
import includes from './util/includes.js'

/**
 * Fetch with retry
 *
 * @param {String} url
 * @param {Object} options @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
 * @param {RetryOptions} retryOptions
 * @returns {Promise<any>}
 */
async function fetchWithRetry (url, options = null, retryOptions = null) {
  const {
    signalTimeout,
    statusCodes,
    maxRetries,
    retryTimeout,
    retryStatusCodes,
    errors
  } = retryOptionsParser.parse(retryOptions)

  for (let n = 0; n < maxRetries; n++) {
    try {
      const signalTimeoutContext = SignalTimeoutContext.create(signalTimeout, url)
      options.signal = signalTimeoutContext.signal

      const response = await fetchProxy.fetch(url, options)
      signalTimeoutContext.abort = false
      if (includes(statusCodes, response.status)) {
        return response
      }

      if (retryStatusCodes.length && !includes(retryStatusCodes, response.status)) {
        const message =
          `Response.status: <${response.status}>, ` +
          `is not retryStatusCodes: <[${retryStatusCodes.join(', ')}]> ` +
          `attempt: <${n + 1}>, willRetry: <false>.`

        // increment n so that we don't retry
        n = maxRetries - 1
        throw new FetchWithRetryError(message)
      }

      if (retryStatusCodes.length && includes(retryStatusCodes, response.status)) {
        throw new FetchWithRetryError(
          `Response.status: <${response.status}>, ` +
          `is in retryStatusCodes: <[${retryStatusCodes.join(', ')}]> ` +
          `attempt: <${n + 1}>, willRetry: <${String(n + 1 < maxRetries)}>.`
        )
      }

      throw new FetchWithRetryError(
        `Response.status: <${response.status}>, ` +
        `not in expected statusCodes: <[${statusCodes.join(', ')}]> ` +
        `attempt: <${n + 1}>, willRetry: <${String(n + 1 < maxRetries)}>.`
      )
    } catch (err) {
      errors.push(err)
      if (n + 1 === maxRetries) {
        throw err
      }
      await sleep(retryTimeout)
    }
  }
}

export default fetchWithRetry
