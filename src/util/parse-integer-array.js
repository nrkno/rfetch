import parseInteger from './parse-integer.js'

export default function parseIntegerArray (list) {
  if (!Array.isArray(list)) {
    const value = parseInteger(list)
    return value ? [value] : null
  }

  return list.map(parseInteger)
    .filter(value => value !== null)
}
