/**
 * @param {number} value
 * @returns {(number|null)}
 */
export default function parseInteger (value) {
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
