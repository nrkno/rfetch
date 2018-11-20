import parseInteger from './util/parse-integer.js'
import parseIntegerArray from './util/parse-integer-array.js'

/**
 * @typedef {Object} RetryOptionsContext
 * @property {AbortController} [context.abortController=null] - The global abortController associated with the retry fetch loop
 * @property {Error[]} [context.errors=null] - the global abortController associated with the retry fetch loop
 * @property {function} [context.sink=null] - A sink function for different phases in the retry fetch loop
 */

/** @type {RetryOptionsContext} */
const defaultRetryOptionsContext = {
  abortController: null,
  errors: [],
  sink: null
}

/**
 * @typedef {Object} RetryOptions
 * @property {number} [signalTimeout=1000] - The signal timeout before aborting the request in ms.
 * @property {(number|number[])} [resolveOn=[200]] - The status code(s) to resolve on
 * @property {number} [retries=3] - The number of the times to retry
 * @property {(number|number[])} [retryTimeout=[100]] - The retry timeout
 * @property {(number|number[])} retryOn - The status code(s) to retry on
 * @property {RetryOptionsContext} context - The retry options context for more advanced control options
 */

/** @type {RetryOptions} */
const defaultRetryOptions = {
  signalTimeout: 1000,
  resolveOn: [ 200 ],
  retries: 3,
  retryTimeout: [ 100 ],
  retryOn: [],
  context: parseContext({})
}

/**
 * @param {Object} context
 * @returns {RetryOptionsContext}
 */
function parseContext (context) {
  if (!context) {
    return Object.assign({}, defaultRetryOptionsContext)
  }

  const parsedContext = context || {}

  // set abortController ref
  parsedContext.abortController = null

  // will put received fetch errors in this array
  parsedContext.errors = Array.isArray(context.errors)
    ? context.errors
    : []

  // set sink ref
  parsedContext.sink = context.sink
    ? context.sink
    : null

  return parsedContext
}

/**
 * @param {Object} options
 * @returns {RetryOptions}
 */
function parse (options = {}) {
  if (!options || Array.isArray(options)) {
    return Object.assign({}, defaultRetryOptions)
  }

  const parsedOptions = options || {}

  for (const key of ['signalTimeout', 'retries']) {
    parsedOptions[key] =
      parseInteger(options[key]) || defaultRetryOptions[key]
  }

  for (const key of ['resolveOn', 'retryTimeout', 'retryOn']) {
    parsedOptions[key] =
      parseIntegerArray(options[key]) || defaultRetryOptions[key]
  }

  parsedOptions.context =
    parseContext(options.context)

  return parsedOptions
}

export default {
  defaultRetryOptions,
  parseContext,
  parse
}
