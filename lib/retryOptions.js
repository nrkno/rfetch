const defaultRetryOptions = {
  maxRetry: 3,
  timeout: 100,
  statusCodes: []
}

function parseInteger (value) {
  if (!value) {
    return null
  }

  return parseInt(Number(value))
}

function parseIntegerArray (list) {
  if (!list) {
    return null
  }

  if (!Array.isArray(list)) {
    return []
  }

  return list.map(parseInteger)
    .filter(value => value !== null)
}

function parse (params) {

}

module.exports = {
  defaultRetryOptions,
  parseInteger,
  parseIntegerArray,
  parse
}
