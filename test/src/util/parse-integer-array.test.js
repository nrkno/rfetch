/* global describe, expect, test */
import parseIntegerArray from '../../../src/util/parse-integer-array.js'

describe('parseIntegerArray', () => {
  test('test with a set of values, should match expected output', () => {
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
      values.map(parseIntegerArray)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })
})
