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

module.exports = {
  parseInteger,
  parseIntegerArray
}
