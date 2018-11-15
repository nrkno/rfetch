function parseInteger (value) {
  if (!value) {
    return null
  }

  const result = Number(value)
  if (isNaN(result)) {
    return null
  }

  return parseInt(result)
}

function parseIntegerArray (list) {
  if (!list || !Array.isArray(list)) {
    return null
  }

  return list.map(parseInteger)
    .filter(value => value !== null)
}

module.exports = {
  parseInteger,
  parseIntegerArray
}
