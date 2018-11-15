/* global describe, expect, test */
const retryOptionsParser = require('../retryOptionsParser')

describe('retryOptionsParser', () => {
  test('calling build with a set of options, should match expected values', () => {
    // Arrange
    const defaultStatusCodes = [ 200 ]
    const defaultRetryStatusCodes = []

    const defaultOptions = {
      maxRetries: 3,
      timeout: 100,
      statusCodes: defaultStatusCodes,
      retryStatusCodes: defaultRetryStatusCodes
    }

    const values = [
      // not defined values
      null,
      undefined,
      {},
      [],

      // defined values
      { maxRetries: 1 },
      { maxRetries: 2, timeout: 200 },
      { maxRetries: 4, timeout: 300, statusCodes: 204, retryStatusCodes: 404 },
      { maxRetries: 5, timeout: 120, statusCodes: [ 200, 201, 304 ], retryStatusCodes: [ 408, 418, 429 ] }
    ]

    const expectedValues = [
      // should yield default options for
      defaultOptions,
      defaultOptions,
      defaultOptions,
      defaultOptions,

      //
      { maxRetries: 1, timeout: 100, statusCodes: defaultStatusCodes, retryStatusCodes: defaultRetryStatusCodes },
      { maxRetries: 2, timeout: 200, statusCodes: defaultStatusCodes, retryStatusCodes: defaultRetryStatusCodes },
      { maxRetries: 4, timeout: 300, statusCodes: [ 204 ], retryStatusCodes: [ 404 ] },
      { maxRetries: 5, timeout: 120, statusCodes: [ 200, 201, 304 ], retryStatusCodes: [ 408, 418, 429 ] }
    ]

    // Act
    const resultValues =
      values.map(retryOptionsParser.parse)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })
})
