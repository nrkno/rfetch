const defaultRetryOptions = {
  signalTimeout: 1000,
  statusCodes: [ 200 ],
  maxRetries: 3,
  retryTimeout: 100,
  retryStatusCodes: [ ],
  errors: []
}

// Helper methods
function parseInteger (value) {
  if (!value) {
    return null
  }

  if (Array.isArray(value)) {
    return null
  }

  const result = Number(value)
  if (isNaN(result)) {
    return null
  }

  return parseInt(result)
}

function parseIntegerArray (list) {
  if (!Array.isArray(list)) {
    const value = parseInteger(list)
    return value ? [ value ] : null
  }

  return list.map(parseInteger)
    .filter(value => value !== null)
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

// es6 module exports (used internally)
export default {
  _parseInteger: parseInteger,
  _parseIntegerArray: parseIntegerArray,

  defaultRetryOptions,
  parse
}

// umd exports
export {
  defaultRetryOptions,
  parse
}
