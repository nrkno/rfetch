/**
 * @param {Number} timeout
 * @returns {Promise<void>}
 */
function sleep (timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

module.exports = sleep
