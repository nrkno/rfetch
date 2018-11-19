/* global describe, expect, test, jest */
import defer from '../../../src/util/defer.js'

describe('defer', () => {
  test('test that defered function is called with correct set of arguments', (done) => {
    jest.useFakeTimers()

    // Arrange
    let mockFunction = jest.fn(_ => _)
    const args = ['hello', 'world', 42]

    // Act
    defer(mockFunction, ...args)
    jest.advanceTimersByTime(1)

    // Assert
    expect(mockFunction).toHaveBeenCalledTimes(1)
    expect(mockFunction).toHaveBeenCalledWith(...args)
    done()
  })
})
