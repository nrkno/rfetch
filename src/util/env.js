export default {
  // if window is present
  window: Object.prototype.toString.call(typeof window !== 'undefined' ? window : 0) === '[object Window]',

  // if process is present only node
  global: Object.prototype.toString.call(typeof global !== 'undefined' ? global : 0) === '[object global]',
  process: Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]',

  // replaced via rollup.config.js
  browser: process.browser
}
