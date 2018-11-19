/* global describe, expect, test */
import parseInteger from '../../../src/util/parse-integer.js'

describe('parseInteger', () => {
  test('test with a set of values, should match expected output', () => {
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
      values.map(parseInteger)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })
})
