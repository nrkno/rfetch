/**
 * Delay program execution
 *
 * @param {number} timeout timeout in miliseconds
 * @returns {Promise<void>}
 */
export default function delay (timeout) {
  return new Promise(
    resolve => setTimeout(resolve, timeout)
  )
}
