/* global describe, expect, test, jest */
import delay from '../../../src/util/delay.js'

describe('Delay', () => {
  test('Expect setTimeout spy to match expected call and arguments', async (done) => {
    jest.useRealTimers()

    // Arrange
    const spy = jest.spyOn(global, 'setTimeout')
    const timeout = 10

    // Act + Assert
    expect(spy).toHaveBeenCalledTimes(0)
    await delay(timeout)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][1]).toBe(timeout)
    spy.mockRestore()
    done()
  })
})
