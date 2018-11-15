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

module.exports = {
  parseInteger,
  parseIntegerArray
}
