/* global beforeEach, afterEach, describe, expect, jest, test */
import SignalTimeoutContext from '../../src/signal-timeout-context.js'

describe('SignalTimeoutContext', () => {
  let spy
  beforeEach(() => {
    spy = jest.spyOn(SignalTimeoutContext.functions, 'abort')
  })
  afterEach(() => {
    spy.mockRestore()
  })

  test('Should dispatch event abort when signal signalTimeout has run out', (done) => {
    // Arrange
    const ctx = SignalTimeoutContext.create(10)
    ctx.signal.addEventListener('abort', () => {
      expect(ctx.signal.aborted).toBe(true)
      expect(spy).toHaveBeenCalledTimes(1)
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
      expect(spy).toHaveBeenCalledTimes(1)
      done()
    }, 10)
  })
})
