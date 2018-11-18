/* global describe, expect, test, jest */
import psleep from '../../../src/util/psleep.js'

describe('sleep', () => {
  test('fake setTimeout should have been called only once', async (done) => {
    jest.useRealTimers()

    // Arrange
    const spy = jest.spyOn(global, 'setTimeout')
    const timeout = 10

    // Act + Assert
    expect(spy).toHaveBeenCalledTimes(0)
    return psleep(timeout).then(() => {
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][1]).toBe(timeout)
      spy.mockRestore()
      done()
    })
  })
})
