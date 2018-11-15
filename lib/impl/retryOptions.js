const parser = require('../util/parser')

const defaultRetryOptions = {
  maxRetry: 3,
  timeout: 100,
  // The status codes to retry for not sure it should only be integer values
  // statusCodes: []
}

function parse (params) {
  if (!params) {
    return defaultRetryOptions
  }

  const options = {}
  for (const key of ['maxRetry', 'timeout']) {
    options[key] =
      parser.parseInteger(params[key]) || defaultRetryOptions[key]
  }

  // options.statusCodes =
  // parser.parseInteger(params.statusCodes) || defaultRetryOptions.statusCodes

  return options
}

module.exports = {
  defaultRetryOptions,
  parse
}
