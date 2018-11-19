/**
 * @param {function} callback
 * @param  {...any} args
 * @returns {number} Returns the timer id.
 */
export default function defer (callback, ...args) {
  return setTimeout(callback, 1, ...args)
}
