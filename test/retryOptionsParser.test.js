/* global describe, expect, test */
const retryOptionsParser = require('../retryOptionsParser')

describe('retryOptionsParser', () => {
  test('calling build with a set of options, should match expected values', () => {
    // Arrange
    const defaultOptions = {
      maxRetries: 3,
      timeout: 100,
      statusCodes: [ 200 ]
    }

    const values = [
      // not defined values
      null,
      undefined,
      {},

      // defined values
      { maxRetries: 1 },
      { maxRetries: 2, timeout: 200 },
      { maxRetries: 4, timeout: 300, statusCodes: [] },
      { maxRetries: 5, timeout: 120, statusCodes: [ 201, 301 ] }
    ]

    const expectedValues = [
      // should yield default options for
      defaultOptions,
      defaultOptions,
      defaultOptions,

      { maxRetries: 1, timeout: 100, statusCodes: [ 200 ] },
      { maxRetries: 2, timeout: 200, statusCodes: [ 200 ] },
      { maxRetries: 4, timeout: 300, statusCodes: [ ] },
      { maxRetries: 5, timeout: 120, statusCodes: [ 201, 301 ] }
    ]

    // Act
    const resultValues =
      values.map(retryOptionsParser.parse)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })
})
