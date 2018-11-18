/**
 * @param {Number} timeout timeout in miliseconds
 * @returns {Promise<void>}
 */
export default function sleep (timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}
