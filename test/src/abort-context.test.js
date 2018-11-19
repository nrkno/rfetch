/* global beforeEach, afterEach, describe, expect, jest, test */
import AbortContext from '../../src/abort-context.js'

describe('AbortContext', () => {
  let abortSpy
  let timeoutSpy
  beforeEach(() => {
    abortSpy = jest.spyOn(AbortContext.definitions, 'abort')
    timeoutSpy = jest.spyOn(global, 'setTimeout')
  })
  afterEach(() => {
    abortSpy.mockRestore()
    timeoutSpy.mockRestore()
  })

  test('Should dispatch event abort when signal signalTimeout has run out', (done) => {
    // Arrange
    const timeout = 10
    const context = AbortContext.create(timeout)

    // Act
    context.controller.signal.addEventListener('abort', () => {
      // Assert
      expect(context.controller.signal.aborted).toBe(true)
      expect(abortSpy).toHaveBeenCalledTimes(1)
      expect(abortSpy.mock.calls[0][0]).toBe(context)
      expect(abortSpy.mock.calls[0][1]).toBe(timeout)

      // defered call
      expect(timeoutSpy.mock.calls[0][1]).toBe(1)
      // setTimeout in abort call
      expect(timeoutSpy.mock.calls[1][1]).toBe(timeout)
      done()
    })
  })

  test('Should not dispatch event abort when signal signalTimeout has run out', (done) => {
    // Arrange
    const signalTimeout = 20
    const context = AbortContext.create(signalTimeout)

    // Act + Assert
    context.abort = false
    setTimeout(() => {
      expect(context.controller.signal.aborted).toBe(false)
      expect(abortSpy).toHaveBeenCalledTimes(1)
      expect(abortSpy.mock.calls[0][0]).toBe(context)
      expect(abortSpy.mock.calls[0][1]).toBe(signalTimeout)

      done()
    }, 10)
  })
})
