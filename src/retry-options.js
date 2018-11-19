import parseInteger from './util/parse-integer.js'
import parseIntegerArray from './util/parse-integer-array.js'

/**
 * @typedef {Object} RetryOptions
 * @property {number} [signalTimeout=1000] - The signal timeout before aborting the request in ms.
 * @property {(number|number[])} [resolveOn=[200]] - The status code(s) to resolve on
 * @property {number} [retries=3] - The number of the times to retry
 * @property {(number|number[])} [retryTimeout=[100]] - The retry timeout
 * @property {(number|number[])} retryOn - The status code(s) to retry on
 * @property {Error[]} errors - An array where to put the fetch errors in
 */

/** @type {RetryOptions} */
const defaultRetryOptions = {
  signalTimeout: 1000,
  resolveOn: [ 200 ],
  retries: 3,
  retryTimeout: [ 100 ],
  retryOn: [],
  errors: []
}

/**
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

  // will put received fetch errors in this array
  parsedOptions.errors = Array.isArray(options.errors)
    ? options.errors
    : []

  return parsedOptions
}

export default {
  defaultRetryOptions,
  parse
}
