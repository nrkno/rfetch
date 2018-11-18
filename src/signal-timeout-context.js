import AbortController from 'abort-controller'
import sleep from './util/sleep'

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
async function abort (controller, context) {
  await sleep(context.signalTimeout)
  if (context.abort) {
    controller.abort()
  }
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

  setTimeout(functions.abort, 1, controller, context)
  return context
}

const functions = {
  abort
}

export default {
  functions,
  create
}
