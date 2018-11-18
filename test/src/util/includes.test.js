/* global describe, expect, test */
import includes from '../../../src/util/includes.js'

describe('sleep', () => {
  test('test with a set of values, should match expected output', () => {
    // Arrange
    const list = [
      10,
      20,
      30,
      40
    ]

    const values = [
      // should yield false
      null,
      undefined,
      true,
      false,
      'hello',

      // should yield true
      10,
      40
    ]

    const expectedResult = [
      // should yield false
      false,
      false,
      false,
      false,
      false,

      // should yield true
      true,
      true
    ]

    // Act
    const result =
      values.map(value => includes(list, value))

    // Assert
    expect(result).toEqual(expectedResult)
  })
})
