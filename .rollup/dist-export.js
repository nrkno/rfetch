/* Guard checks for Promise, Fetch and AbortController implementations */
if (!Object.prototype.toString.call(typeof Promise !== 'undefined' ? Promise : 0)) {
  throw new Error('No Promise available implementation please ensure a polyfill available')
}

if (!Object.prototype.toString.call(typeof fetch !== 'undefined' ? fetch : 0)) {
  throw new Error('No fetch available implementation please ensure a polyfill available')
}

if (!Object.prototype.toString.call(typeof AbortController !== 'undefined' ? AbortController : 0)) {
  throw new Error('No AbortController implementation available please ensure a polyfill available')
}

export { default } from '../src/fetch-with-retry.js'
