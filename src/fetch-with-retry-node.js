import AbortController from 'abort-controller'
import fetch from 'node-fetch'

import FetchWithRetryError from './fetch-with-retry-error.js'
import retryOptionsParser from './retry-options-parser.js'
import sleep from './sleep.js'

function createSignalTimeoutContext (signalTimeout) {
  const controller = new AbortController()
  const context = {
    signal: controller.signal,
    signalTimeoutDispatch: true
  }

  context.signal = controller.signal
  context.signalTimeoutDispatch = true

  setImmediate(async () => {
    // console.log('await signalTimeout', signalTimeout)
    await sleep(signalTimeout)

    // console.log('context.signalTimeoutDispatch', context.signalTimeoutDispatch)
    if (context.signalTimeoutDispatch) {
      controller.abort()
    }
  })

  return context
}

/* used for test spies */
const fetchProxy = { fetch }

/**
 * Fetch with retry
 *
 * @param {String} url
 * @param {Object} options @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
 * @param {*} retryOptions
 * @returns {Promise<any}
 */
async function fetchWithRetry (url, options = null, retryOptions = null) {
  // const originalSignal = options.signal || null

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
      const signalTimeoutContext = createSignalTimeoutContext(signalTimeout, url)
      options.signal = signalTimeoutContext.signal

      const response = await fetchProxy.fetch(url, options)
      signalTimeoutContext.signalTimeoutDispatch = false
      if (statusCodes.includes(response.status)) {
        return response
      }

      if (retryStatusCodes.length && !retryStatusCodes.includes(response.status)) {
        const message =
          `Response.status: <${response.status}>, ` +
          `is not retryStatusCodes: <[${retryStatusCodes.join(', ')}]> ` +
          `attempt: <${n + 1}>, willRetry: <false>.`

        // increment n so that we don't retry
        n = maxRetries - 1
        throw new FetchWithRetryError(message)
      }

      if (retryStatusCodes.length && retryStatusCodes.includes(response.status)) {
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

/* es6 module export (used internally) */
export default fetchWithRetry

/* umd exports */
export {
  createSignalTimeoutContext,
  fetchProxy,
  fetchWithRetry
}
