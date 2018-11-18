/* Guard checks for Promise, Fetch and AbortController implementations */
if (!!(typeof Promise !== 'undefined' ? Promise : null)) {
  throw new Error('No Promise available implementation please ensure a polyfill available')
}

if (!!(typeof fetch !== 'undefined' ? fetch : null)) {
  throw new Error('No fetch available implementation please ensure a polyfill available')
}

if (!!(typeof AbortController !== 'undefined' ? AbortController : null)) {
  throw new Error('No AbortController implementation available please ensure a polyfill available')
}

export { default } from '../src/fetch-with-retry.js'
