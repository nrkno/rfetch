/* global describe, expect, test */
const retryOptionsParser = require('../retryOptionsParser')

describe('retryOptionsParser', () => {
  test('calling build with a set of options, should match expected values', () => {
    // Arrange
    const defaultOptions = {
      signalTimeout: 1000,
      statusCodes: [ 200 ],
      maxRetries: 3,
      retryTimeout: 100,
      retryStatusCodes: []
    }

    const values = [
      // not defined values
      null,
      undefined,
      {},
      [],

      // defined values
      { signalTimeout: 600, statusCodes: 204, maxRetries: 2, retryTimeout: 200, retryStatusCodes: 404 },
      { signalTimeout: 1200, statusCodes: [200, 201, 304], maxRetries: 5, retryTimeout: 300, retryStatusCodes: [408, 418, 429] }
    ]

    const expectedValues = [
      // should yield default options for
      defaultOptions,
      defaultOptions,
      defaultOptions,
      defaultOptions,

      // defined options set
      { signalTimeout: 600, statusCodes: [ 204 ], maxRetries: 2, retryTimeout: 200, retryStatusCodes: [ 404 ] },
      { signalTimeout: 1200, statusCodes: [200, 201, 304], maxRetries: 5, retryTimeout: 300, retryStatusCodes: [408, 418, 429] }
    ]

    // Act
    const resultValues =
      values.map(retryOptionsParser.parse)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })
})
