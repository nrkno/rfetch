import parseInteger from './util/parse-integer.js'
import parseIntegerArray from './util/parse-integer-array.js'

const defaultRetryOptions = {
  signalTimeout: 1000,
  statusCodes: [ 200 ],
  maxRetries: 3,
  retryTimeout: 100,
  retryStatusCodes: [ ],
  errors: []
}

/**
 * Parse Retry Options
 *
 * @param {Object} options
 * @param {Number} [options.maxRetries = 3] The number of retries
 * @param {Number} [options.timeout = 100] The number of timeout in ms before next retry
 * @param {Number[]} [options.statusCodes = [200]] The status codes to retry for if the status code is not expected
 * @returns
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
