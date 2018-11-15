/* global describe, expect, test */
const parser = require('../../util/parser')

describe('parser', () => {
  test('parseInteger', () => {
    // Arrange
    const values = [
      // yields NaN values
      null,
      undefined,
      'svada',
      'x10a',
      NaN,

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

      // parsed values
      200,
      301,
      404
    ]

    // Act
    const resultValues =
      values.map(parser.parseInteger)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })

  test('parseIntegerArray', () => {
    const values = [
      // non arrays
      null,
      undefined,
      {},

      // arrays
      [],
      [200, null, '301', NaN, 404]
    ]

    const expectedValues = [
      null,
      null,
      null,

      //
      [],
      [200, 301, 404]
    ]

    // Act
    const resultValues =
      values.map(parser.parseIntegerArray)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })
})
