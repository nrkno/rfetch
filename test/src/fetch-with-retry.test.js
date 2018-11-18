/* global beforeEach, afterEach, describe, expect, jest, test */
/**
 * @jest-environment node
 */
import nock from 'nock'

import fetchImpl from '../../src/fetch-impl.js'
import fetchWithRetry from '../../src/fetch-with-retry.js'

describe('fetch with retry for node', () => {
  let spy
  beforeEach(() => {
    spy = jest.spyOn(fetchImpl.functions, 'fetchImpl')
  })

  afterEach(() => {
    spy.mockRestore()
  })

  test('Should fail after 5 consecutive 503 (service unavailable) responses', async (done) => {
    // Arrange
    const url = `http://localhost/unavailable`
    const options = {}
    const defaultRetryTimeout = 100
    const errors = []
    const retryOptions = {
      maxRetries: 5,
      retryTimeout: defaultRetryTimeout,
      errors
    }

    const expectedMaxRetries = 5
    const expectedErrors = [
      'FetchWithRetryError: Response.status: <503>, not in expected statusCodes: <[200]> attempt: <1>, willRetry: <true>.',
      'FetchWithRetryError: Response.status: <503>, not in expected statusCodes: <[200]> attempt: <2>, willRetry: <true>.',
      'FetchWithRetryError: Response.status: <503>, not in expected statusCodes: <[200]> attempt: <3>, willRetry: <true>.',
      'FetchWithRetryError: Response.status: <503>, not in expected statusCodes: <[200]> attempt: <4>, willRetry: <true>.',
      'FetchWithRetryError: Response.status: <503>, not in expected statusCodes: <[200]> attempt: <5>, willRetry: <false>.'
    ]

    // Mock http calls
    for (let i = 0; i < expectedMaxRetries; i++) {
      nock('http://localhost')
        .get('/unavailable')
        .reply(503, '')
    }

    // Act + Assert
    fetchWithRetry(url, options, retryOptions)
      .catch(e => {
        const resultErrors =
          errors.map(err => err.toString())

        expect(resultErrors).toEqual(expectedErrors)
        expect(spy).toBeCalledTimes(expectedMaxRetries)
        setTimeout(done, 10)
      })
  })

  test('Should fail after 3 varying http error, two are in the retryStatusCodes while the last is not', async (done) => {
    const url = `http://localhost/vary-error-responses-503-408-400`
    const options = {}
    const errors = []
    const retryOptions = {
      maxRetries: 5,
      retryStatusCodes: [ 503, 408 ],
      errors
    }

    // Mock http calls
    const responses = [
      [ 503, '' ], // Service unavailable
      [ 408, '' ], // request timeout
      [ 400, 'Bad Request' ]
    ]

    for (const response of responses) {
      nock('http://localhost')
        .get('/vary-error-responses-503-408-400')
        .reply(() => response)
    }

    const expectedMaxRetries = 3
    const expectedErrors = [
      'FetchWithRetryError: Response.status: <503>, is in retryStatusCodes: <[503, 408]> attempt: <1>, willRetry: <true>.',
      'FetchWithRetryError: Response.status: <408>, is in retryStatusCodes: <[503, 408]> attempt: <2>, willRetry: <true>.',
      'FetchWithRetryError: Response.status: <400>, is not retryStatusCodes: <[503, 408]> attempt: <3>, willRetry: <false>.'
    ]

    // Act + Assert
    fetchWithRetry(url, options, retryOptions)
      .catch(() => {
        const resultErrors =
          errors.map(err => err.toString())

        expect(resultErrors).toEqual(expectedErrors)

        expect(spy).toBeCalledTimes(expectedMaxRetries)
        setTimeout(done, 10)
      })
  })

  test('Should succeed after the http following codes: [ 408, 418 ], with statusCode: 200', async (done) => {
    // Arrange
    const url = `http://localhost/vary-responses-408-418-200`
    const options = {}
    const errors = []
    const retryOptions = {
      maxRetries: 5,
      errors
    }

    const expectedMaxRetries = 3
    const expectedStatusCode = 200
    const expectedErrors = [
      'FetchWithRetryError: Response.status: <408>, not in expected statusCodes: <[200]> attempt: <1>, willRetry: <true>.',
      'FetchWithRetryError: Response.status: <418>, not in expected statusCodes: <[200]> attempt: <2>, willRetry: <true>.'
    ]

    // Mock http calls
    const responses = [
      [ 408, '' ], // request timeout
      [ 418, '' ], // teapot
      [ 200, 'OK' ]
    ]

    for (const response of responses) {
      nock('http://localhost')
        .get('/vary-responses-408-418-200')
        .reply(() => response)
    }

    // Act + Assert
    fetchWithRetry(url, options, retryOptions)
      .then(response => {
        const resultErrors =
          errors.map(err => err.toString())

        expect(resultErrors).toEqual(expectedErrors)
        expect(response.status).toEqual(expectedStatusCode)

        expect(spy).toBeCalledTimes(expectedMaxRetries)
        setTimeout(done, 10)
      })
  })

  test('Should succeed after retryStatusCode: 408 on statusCode: 304', async (done) => {
    // Arrange
    const url = `http://localhost/vary-responses-408-304-418`
    const options = {}
    const errors = []
    const retryOptions = {
      statusCodes: 304,
      maxRetries: 5,
      errors
    }

    const expectedMaxRetries = 2
    const expectedStatusCode = 304
    const expectedError = 'FetchWithRetryError: Response.status: <408>, not in expected statusCodes: <[304]> attempt: <1>, willRetry: <true>.'

    // Mock http calls
    const responses = [
      [408, ''], // request timeout
      [304, ''], //
      [418, ''] // teapot
    ]

    for (const response of responses) {
      nock('http://localhost')
        .get('/vary-responses-408-304-418')
        .reply(() => response)
    }

    // Act and Assert
    fetchWithRetry(url, options, retryOptions)
      .then(response => {
        expect(errors[0].toString()).toEqual(expectedError)
        expect(response.status).toEqual(expectedStatusCode)

        expect(spy).toBeCalledTimes(expectedMaxRetries)
        setTimeout(done, 10)
      })
  })
})
