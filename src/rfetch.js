import RFetchError from './rfetch-error.js'
import AbortController from './impl/abort-controller-impl'
import AbortContext from './abort-context.js'
import RetryOptions from './retry-options.js'
import fetchImpl from './impl/fetch-impl.js'
import includes from './util/includes.js'

// noop sink callback
const retrySinkNoop =
  _ => _

/**
 * @typedef {Object} RetryFetchLoopCtx
 * @param {AbortContext} abortContext
 * @param {number} n
 * @param {number} timeoutIndex
 * @param {function} resolve
 * @param {function} reject
 */

/**
 * @param {String} url
 * @param {Object} options
 * @param {RetryOptions} retryOptions
 * @param {RetryFetchLoopCtx} loopCtx
 */
function retryFetchLoopIteration (url, options, retryOptions, loopCtx) {
  const {
    signalTimeout,
    resolveOn,
    retries,
    retryOn
  } = retryOptions

  loopCtx.abortContext =
    AbortContext.create(signalTimeout, url)

  options.signal = loopCtx.abortContext.controller.signal

  retryOptions.context.sink(
    'fetch.start', { url, iteration: loopCtx.n, retries }
  )

  return fetchImpl.fetch(url, options)
    .then(response => {
      /*
        Response handling heuristics:
        ----------------------------
        1. Set abortContext.abort = false, response was received within the timeout
        2. If response.status in resolveOn statusCodes return response and terminate loop
        3. if retryOn status codes is non empty, and response.status not in retryOn status codes throw error and terminate loop.
        4. if retryOn status codes is non empty, and response.status is in retryOn status codes throw error and maybe continue loop.
        5. Otherwise response.status not in resolveOn status code throw error and maybe continue loop.
      */

      /* 1 */
      loopCtx.abortContext.abort = false

      /* 2 */
      if (includes(resolveOn, response.status)) {
        return response
      }

      /* 3 */
      if (retryOn.length && !includes(retryOn, response.status)) {
        const message =
          `Response.status: <${response.status}>, ` +
          `not in retryOn: <[${retryOn.join(', ')}]> status codes, ` +
          `attempt: <${loopCtx.n + 1}> of: <${retries}> retries, willRetry: <false>.`

        // increment n so that we don't retry
        loopCtx.n = retries - 1
        throw new RFetchError(message)
      }

      /* 4 */
      if (retryOn.length && includes(retryOn, response.status)) {
        throw new RFetchError(
          `Response.status: <${response.status}>, ` +
          `is in retryOn: <[${retryOn.join(', ')}]> status codes, ` +
          `attempt: <${loopCtx.n + 1}> of: <${retries}> retries, willRetry: <${String(loopCtx.n + 1 < retries)}>.`
        )
      }

      /* 5 */
      throw new RFetchError(
        `Response.status: <${response.status}>, ` +
        `not in resolveOn: <[${resolveOn.join(', ')}]> status codes, ` +
        `attempt: <${loopCtx.n + 1}> of: <${retries}> retries, willRetry: <${String(loopCtx.n + 1 < retries)}>.`
      )
    })
}

/**
 *
 * @param {String} url
 * @param {Object} options
 * @param {RetryOptions} retryOptions
 * @param {Object} promise
 * @param {number} n
 */
function retryFetchLoopDefer (timeout, url, options, retryOptions, promise, n) {
  setTimeout(
    definitions.retryFetchLoop,
    timeout,
    url, options, retryOptions, promise, n
  )
}

/**
 *
 * @param {String} url
 * @param {Object} options
 * @param {RetryOptions} retryOptions
 * @param {RetryFetchLoopCtx} loopCtx
 */
function retryFetchLoop (url, options, retryOptions, loopCtx) {
  retryOptions.context.abortController = new AbortController()
  if (!retryOptions.context.sink) {
    retryOptions.context.sink = definitions.retrySinkNoop
  }

  // user signals global abort
  retryOptions.context.abortController.signal
    .addEventListener(
      'abort',
      () => loopCtx.abortContext ? loopCtx.abortContext.controller.abort() : undefined
    )

  definitions.retryFetchLoopIteration(url, options, retryOptions, loopCtx)
    .then(response => {
      retryOptions.context.sink(
        'fetch.success', { url, iteration: loopCtx.n, retries: retryOptions.retries }
      )

      loopCtx.resolve(response)
    })
    .catch(
      err => {
        retryOptions.context.sink(
          'fetch.failure', { url, iteration: loopCtx.n, retries: retryOptions.retries, error: err }
        )

        retryOptions.context.errors.push(err)
        if (loopCtx.n + 1 === retryOptions.retries || retryOptions.context.abortController.signal.aborted) {
          loopCtx.reject(err)
          return
        }

        // augment next loop iteration
        loopCtx.n = loopCtx.n + 1

        // set next timeoutIndex
        if (loopCtx.timeoutIndex + 1 >= retryOptions.retryTimeout.length) {
          loopCtx.timeoutIndex = 0
        } else if (loopCtx.n > 1) {
          loopCtx.timeoutIndex = loopCtx.timeoutIndex + 1
        }

        definitions.retryFetchLoopDefer(
          retryOptions.retryTimeout[loopCtx.timeoutIndex], url, options, retryOptions, loopCtx
        )
      }
    )
}

/**
 * Retry Fetch (rfetch)
 *
 * @param {String} url The url to fetch
 * @param {Object} options Fetch options
 * @param {RetryOptions} retryOptions
 * @returns {Promise<any>}
 */
function rfetch (url, options = null, retryOptions = null) {
  return new Promise((resolve, reject) => (
    definitions.retryFetchLoop(
      url,
      options || {},
      RetryOptions.parse(retryOptions),
      {
        abortContext: null,
        n: 0,
        timeoutIndex: 0,
        resolve,
        reject
      }
    )
  ))
}

const definitions = {
  retrySinkNoop,
  retryFetchLoop,
  retryFetchLoopDefer,
  retryFetchLoopIteration
}

export default rfetch
export {
  definitions,
  rfetch
}
