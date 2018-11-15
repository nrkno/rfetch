/* global window */
const isNodeEnv =
  Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'

if (isNodeEnv) {
  module.exports = require('./fetchWithRetryNode')
} else {
  // Check for Promise support
  if (!window.Promise) {
    throw new Error('Promise not supported or no polyfill found')
  }

  // Check for Fetch support
  if (!window.Fetch) {
    throw new Error('Fetch not supported or no polyfill found')
  }

  // Check for Async support
  let asyncSupported = true
  try {
    eval("(function() { async function () {} })()");
  } catch (e) {
    asyncSupported = false
  }

  module.exports = asyncSupported
    ? require('./fetchWithRetryWindowAsync')
    : require('./fetchWithRetryWindowTimeout')
}
