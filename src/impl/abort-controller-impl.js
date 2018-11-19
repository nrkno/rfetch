import AbortController from 'abort-controller'

/*
  Rollup target is web, use window.AbortController,
  otherwise use AbortController from the `abort-controller` library
*/
const AbortControllerImpl = process.env.rollupTargetWeb
  ? window.AbortController
  : AbortController

export default AbortControllerImpl
