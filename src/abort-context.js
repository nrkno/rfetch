import AbortControllerIpml from './impl/abort-controller-impl'

/**
 * @typedef {Object} AbortContext
 * @property {AbortController} controller - the abort controller
 * @property {boolean} abort - writable boolean value that indicates whether we should abort or not when the signal timeout has run out
 */

/**
 * @param {AbortContext} context
 * @param {number} timeout
 */
function abort (context, timeout) {
  setTimeout(
    () => context.abort ? context.controller.abort() : undefined,
    timeout
  )
}

/**
 * Create an abort context
 *
 * @param {number} timeout in ms
 * @returns {AbortContext}
 */
function create (timeout) {
  const context = {}
  context.controller = new AbortControllerIpml()
  context.abort = true

  setTimeout(definitions.abort, 1, context, timeout)
  return context
}

const definitions = {
  abort
}

export default {
  definitions,
  create
}
