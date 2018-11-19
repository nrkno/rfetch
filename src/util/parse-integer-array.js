import parseInteger from './parse-integer.js'

/**
 * @param {any[]} list
 * @returns {(number[]|null)}
 */
export default function parseIntegerArray (list) {
  if (!Array.isArray(list)) {
    const value = parseInteger(list)
    return value ? [ value ] : null
  }

  return list.map(parseInteger)
    .filter(value => value !== null)
}
