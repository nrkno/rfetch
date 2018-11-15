/* global describe, expect, test */
const retryOptionsParser = require('../retry-options-parser')

describe('retryOptionsParser', () => {
  test('parseInteger', () => {
    // Arrange
    const values = [
      // yields NaN values
      null,
      undefined,
      'svada',
      'x10a',
      NaN,
      [],

      // allowed values
      200,
      '301',
      404.00
    ]

    const expectedValues = [
      // null or values that yield NaN should return null
      null,
      null,
      null,
      null,
      null,
      null,

      // parsed values
      200,
      301,
      404
    ]

    // Act
    const resultValues =
      values.map(retryOptionsParser._parseInteger)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })

  test('parseIntegerArray', () => {
    const values = [
      // non arrays
      null,
      undefined,
      {},

      // single number
      200,
      '302',

      // arrays
      [],
      [200, null, '301', NaN, 404]
    ]

    const expectedValues = [
      null,
      null,
      null,

      // single numbers
      [200],
      [302],

      //
      [],
      [200, 301, 404]
    ]

    // Act
    const resultValues =
      values.map(retryOptionsParser._parseIntegerArray)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })

  test('calling parse with a set of options, should match expected values', () => {
    // Arrange
    const defaultOptions = {
      signalTimeout: 1000,
      statusCodes: [ 200 ],
      maxRetries: 3,
      retryTimeout: 100,
      retryStatusCodes: [],
      errors: []
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
      { signalTimeout: 600, statusCodes: [ 204 ], maxRetries: 2, retryTimeout: 200, retryStatusCodes: [ 404 ], errors: [] },
      { signalTimeout: 1200, statusCodes: [200, 201, 304], maxRetries: 5, retryTimeout: 300, retryStatusCodes: [408, 418, 429], errors: [] }
    ]

    // Act
    const resultValues =
      values.map(retryOptionsParser.parse)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })
})
