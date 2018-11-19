import RFetchError from './rfetch-error.js'
import AbortContext from './abort-context.js'
import RetryOptions from './retry-options.js'
import fetchImpl from './fetch-impl.js'
import includes from './util/includes.js'

/**
 * @typedef {Object} RetryFetchLoopCtx
 * @param {number} n
 * @param {number} timeoutIndex
 * @param {function} resolve
 * @param {function} reject
 */

/**
 * @param {String} url
 * @param {Object} options
 * @param {RetryOptions} retryOptions
 * @param {RetryFetchLoopCtx} ctx
 */
function retryFetchLoopIteration (url, options, retryOptions, ctx) {
  const {
    signalTimeout,
    resolveOn,
    retries,
    retryOn
  } = retryOptions

  const abortContext =
    AbortContext.create(signalTimeout, url)

  options.signal = abortContext.signal

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
      abortContext.abort = false

      /* 2 */
      if (includes(resolveOn, response.status)) {
        return response
      }

      /* 3 */
      if (retryOn.length && !includes(retryOn, response.status)) {
        const message =
          `Response.status: <${response.status}>, ` +
          `not in retryOn: <[${retryOn.join(', ')}]> status codes, ` +
          `attempt: <${ctx.n + 1}> of: <${retries}> retries, willRetry: <false>.`

        // increment n so that we don't retry
        ctx.n = retries - 1
        throw new RFetchError(message)
      }

      /* 4 */
      if (retryOn.length && includes(retryOn, response.status)) {
        throw new RFetchError(
          `Response.status: <${response.status}>, ` +
          `is in retryOn: <[${retryOn.join(', ')}]> status codes, ` +
          `attempt: <${ctx.n + 1}> of: <${retries}> retries, willRetry: <${String(ctx.n + 1 < retries)}>.`
        )
      }

      /* 5 */
      throw new RFetchError(
        `Response.status: <${response.status}>, ` +
        `not in resolveOn: <[${resolveOn.join(', ')}]> status codes, ` +
        `attempt: <${ctx.n + 1}> of: <${retries}> retries, willRetry: <${String(ctx.n + 1 < retries)}>.`
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
 * @param {RetryFetchLoopCtx} ctx
 */
function retryFetchLoop (url, options, retryOptions, ctx) {
  definitions.retryFetchLoopIteration(url, options, retryOptions, ctx)
    .then(ctx.resolve)
    .catch(
      err => {
        retryOptions.errors.push(err)
        if (ctx.n + 1 === retryOptions.retries) {
          ctx.reject(err)
          return
        }

        // augment next loop iteration
        ctx.n = ctx.n + 1

        // set nex timeoutIndex
        if (ctx.timeoutIndex + 1 >= retryOptions.retryTimeout.length) {
          ctx.timeoutIndex = 0
        } else if (ctx.n > 1) {
          ctx.timeoutIndex = ctx.timeoutIndex + 1
        }

        definitions.retryFetchLoopDefer(
          retryOptions.retryTimeout[ctx.timeoutIndex], url, options, retryOptions, ctx
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
        n: 0,
        timeoutIndex: 0,
        resolve,
        reject
      }
    )
  ))
}

const definitions = {
  retryFetchLoop,
  retryFetchLoopDefer,
  retryFetchLoopIteration
}

export default rfetch
export {
  definitions,
  rfetch
}
