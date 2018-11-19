import AbortControllerIpml from './impl/abort-controller-impl'

/**
 * @typedef {Object} AbortContext
 * @property {AbortController.AbortSignal} signal - the abort signal
 * @property {boolean} abort - writable boolean value that indicates whether we should abort or not when the signal timeout has run out
 */

/**
 * @param {AbortController} controller
 * @param {AbortContext} context
 * @param {number} timeout
 */
function abort (controller, context, timeout) {
  setTimeout(
    () => context.abort ? controller.abort() : undefined,
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
  const controller = new AbortControllerIpml()
  const context = {
    signal: controller.signal,
    abort: true
  }

  setTimeout(definitions.abort, 1, controller, context, timeout)
  return context
}

const definitions = {
  abort
}

export default {
  definitions,
  create
}
