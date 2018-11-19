/* global describe, expect, test */
import retryOptions from '../../src/retry-options.js'

describe('retryOptions', () => {
  test('calling parse with a set of options, should match expected values', () => {
    // Arrange
    const defaultOptions = {
      signalTimeout: 1000,
      resolveOn: [ 200 ],
      retries: 3,
      retryTimeout: [ 100 ],
      retryOn: [],
      context: {
        abortController: null,
        errors: [],
        sink: null
      }
    }

    const myErrors = [
      new Error('test')
    ]

    const mySink =
      _ => _

    const values = [
      // not defined values
      null,
      undefined,
      {},
      [],

      // defined values
      { signalTimeout: 600, resolveOn: 204, retries: 2, retryTimeout: 200, retryOn: 404 },
      { signalTimeout: 1200, resolveOn: [200, 201, 304], retries: 5, retryTimeout: [100, 300, 500], retryOn: [408, 418, 429], context: { errors: myErrors, sink: mySink } }
    ]

    const expectedValues = [
      // should yield default options for
      defaultOptions,
      defaultOptions,
      defaultOptions,
      defaultOptions,

      // defined options set
      { signalTimeout: 600, resolveOn: [204], retries: 2, retryTimeout: [200], retryOn: [404], context: { abortController: null, errors: [], sink: null } },
      { signalTimeout: 1200, resolveOn: [200, 201, 304], retries: 5, retryTimeout: [100, 300, 500], retryOn: [408, 418, 429], context: { abortController: null, errors: myErrors, sink: mySink } }
    ]

    // Act
    const resultValues =
      values.map(retryOptions.parse)

    // Assert
    expect(resultValues).toEqual(expectedValues)
  })
})
