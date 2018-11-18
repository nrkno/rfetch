/* global beforeEach, afterEach, describe, expect, jest, test */
import SignalTimeoutContext from '../../src/signal-timeout-context.js'

describe('SignalTimeoutContext', () => {
  let signalSpy
  let timeoutSpy
  beforeEach(() => {
    signalSpy = jest.spyOn(SignalTimeoutContext.functions, 'abort')
    timeoutSpy = jest.spyOn(global, 'setTimeout')
  })
  afterEach(() => {
    signalSpy.mockRestore()
    timeoutSpy.mockRestore()
  })

  test('Should dispatch event abort when signal signalTimeout has run out', (done) => {
    // Arrange
    const signalTimeout = 10
    const ctx = SignalTimeoutContext.create(signalTimeout)
    ctx.signal.addEventListener('abort', () => {
      expect(ctx.signal.aborted).toBe(true)
      expect(signalSpy).toHaveBeenCalledTimes(1)
      expect(signalSpy.mock.calls[0][1]).toBe(ctx)

      // defered call
      expect(timeoutSpy.mock.calls[0][1]).toBe(1)
      // sleep call
      expect(timeoutSpy.mock.calls[1][1]).toBe(signalTimeout)
      done()
    })
  })

  test('Should not dispatch event abort when signal signalTimeout has run out', (done) => {
    // Arrange
    jest.useRealTimers()

    const ctx = SignalTimeoutContext.create(10)
    ctx.abort = false
    setTimeout(() => {
      expect(ctx.signal.aborted).toBe(false)
      expect(signalSpy).toHaveBeenCalledTimes(1)
      expect(timeoutSpy).toHaveBeenCalledTimes(1)
      done()
    }, 10)
  })
})
