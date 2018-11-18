import AbortController from 'abort-controller'
import psleep from './util/psleep.js'

/**
 * @typedef {Object} SignalTimeoutContext
 * @property {AbortController.AbortSignal} signal - the abort signal
 * @property {number} signalTimeout - the signal timeout to wait before aborting
 * @property {boolean} abort - writable boolean value that indicates whether we should abort or not when the signal timeout has run out
 */

/**
 * @param {AbortController} controller
 * @param {SignalTimeoutContext} context
 */
function abort (controller, context) {
  psleep(context.signalTimeout)
    .then(() => {
      if (context.abort) {
        controller.abort()
      }
    })
}

/**
 *
 * @param {number} signalTimeout in ms
 * @returns
 */
function create (signalTimeout) {
  const controller = new AbortController()
  const context = {
    signal: controller.signal,
    signalTimeout,
    abort: true
  }

  setTimeout(definitions.abort, 1, controller, context)
  return context
}

const definitions = {
  abort
}

export default {
  definitions,
  create
}
