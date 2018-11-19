/* global beforeEach, afterEach, describe, expect, jest, test */
import AbortContext from '../../src/abort-context.js'

describe('AbortContext', () => {
  let signalSpy
  let timeoutSpy
  beforeEach(() => {
    signalSpy = jest.spyOn(AbortContext.definitions, 'abort')
    timeoutSpy = jest.spyOn(global, 'setTimeout')
  })
  afterEach(() => {
    signalSpy.mockRestore()
    timeoutSpy.mockRestore()
  })

  test('Should dispatch event abort when signal signalTimeout has run out', (done) => {
    // Arrange
    const signalTimeout = 10
    const ctx = AbortContext.create(signalTimeout)

    // Act
    ctx.signal.addEventListener('abort', () => {
      // Assert
      expect(ctx.signal.aborted).toBe(true)
      expect(signalSpy).toHaveBeenCalledTimes(1)
      expect(signalSpy.mock.calls[0][1]).toBe(ctx)
      expect(signalSpy.mock.calls[0][2]).toBe(signalTimeout)

      // defered call
      expect(timeoutSpy.mock.calls[0][1]).toBe(1)
      // setTimeout in abort call
      expect(timeoutSpy.mock.calls[1][1]).toBe(signalTimeout)
      done()
    })
  })

  test('Should not dispatch event abort when signal signalTimeout has run out', (done) => {
    // Arrange
    const signalTimeout = 20
    const ctx = AbortContext.create(signalTimeout)

    // Act + Assert
    ctx.abort = false
    setTimeout(() => {
      expect(ctx.signal.aborted).toBe(false)
      expect(signalSpy).toHaveBeenCalledTimes(1)
      expect(signalSpy.mock.calls[0][1]).toBe(ctx)
      expect(signalSpy.mock.calls[0][2]).toBe(signalTimeout)

      done()
    }, 10)
  })
})
