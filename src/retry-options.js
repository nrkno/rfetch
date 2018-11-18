import parseInteger from './util/parse-integer.js'
import parseIntegerArray from './util/parse-integer-array.js'

/**
 * @typedef {Object} RetryOptions
 * @property {number} signalTimeout
 * @property {number[]} statusCodes
 * @property {number} maxRetries
 * @property {number} retryTimeout
 * @property {number[]} retryStatusCodes
 * @property {Error[]} errors
 */

/** @type {RetryOptions} */
const defaultRetryOptions = {
  signalTimeout: 1000,
  statusCodes: [ 200 ], // resolveOn
  maxRetries: 3,
  retryTimeout: 100,
  retryStatusCodes: [ ], // retryOn ?
  errors: []
}

/**
 * Parse Retry Options
 *
 * @param {Object} options
 * @param {number} [options.maxRetries = 3] The number of retries
 * @param {number} [options.timeout = 100] The number of timeout in ms before next retry
 * @param {number[]} [options.statusCodes = [200]] The status codes to retry for if the status code is not expected
 * @returns {RetryOptions}
 */
function parse (options = {}) {
  if (!options || Array.isArray(options)) {
    return Object.assign({}, defaultRetryOptions)
  }

  const parsedOptions = options || {}

  for (const key of ['maxRetries', 'retryTimeout', 'signalTimeout']) {
    parsedOptions[key] =
      parseInteger(options[key]) || defaultRetryOptions[key]
  }

  for (const key of ['statusCodes', 'retryStatusCodes']) {
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
