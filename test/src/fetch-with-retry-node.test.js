/* global beforeAll, afterAll, beforeEach, afterEach, describe, expect, jest, test */
/**
 * @jest-environment node
 */
import nock from 'nock'

import {
  createSignalTimeoutContext,
  fetchProxy,
  fetchWithRetry
} from '../../src/fetch-with-retry-node.js'

import sleep from '../../src/sleep.js'
import server from '../server.js'

describe('fetch with retry for node', () => {
  // setup and teardown
  beforeAll(async () => {
    try {
      await server.start(30001)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })

  afterAll(async () => {
    try {
      await server.stop()
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })

  let spy
  beforeEach(() => {
    spy = jest.spyOn(fetchProxy, 'fetch')
  })

  afterEach(() => {
    server.clearMocks()
    spy.mockRestore()
  })

  test('Should call createSignalTimeoutContext when signal is signalTimeout is run', (done) => {
    const signalTimeoutContext = createSignalTimeoutContext(10)
    signalTimeoutContext.signal.addEventListener('abort', () => {
      expect(signalTimeoutContext.signal.aborted).toBe(true)
      done()
    })
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

  test('Should fail after [signal error, 408, signal error, 503, signal error]', async (done) => {
    // Arrange
    const path = '/vary-responses-signal-408-signal-503-signal'
    const url = `${server.uri}${path}`
    const options = {}
    const errors = []
    const retryOptions = {
      statusCodes: 200,
      maxRetries: 5,
      signalTimeout: 100,
      retryTimeout: 100,
      retryCodes: [ 503, 408 ],
      errors
    }

    const expectedMaxRetries = 5
    const expectedErrors = [
      'AbortError: The user aborted a request.',
      'FetchWithRetryError: Response.status: <503>, not in expected statusCodes: <[200]> attempt: <2>, willRetry: <true>.',
      'AbortError: The user aborted a request.',
      'FetchWithRetryError: Response.status: <408>, not in expected statusCodes: <[200]> attempt: <4>, willRetry: <true>.',
      'AbortError: The user aborted a request.'
    ]

    // Mock Responses
    server.mockRequestPathResponses(
      path,
      // signal (slow network)
      async () => {
        await sleep(200)
        return {
          statusCode: 501,
          body: ''
        }
      },
      // service unavailable
      () => {
        return {
          statusCode: 503,
          body: ''
        }
      },
      // signal (slow network)
      async () => {
        await sleep(200)
        return {
          statusCode: 503,
          body: ''
        }
      },
      // request timeout
      async () => {
        return {
          statusCode: 408,
          body: ''
        }
      },
      // ok
      async () => {
        await sleep(200)
        return {
          statusCode: 200,
          body: 'OK'
        }
      }
    )

    // Act and Assert
    fetchWithRetry(url, options, retryOptions)
      .catch(() => {
        const resultErrors = errors.map(err => err.toString())
        expect(resultErrors).toEqual(expectedErrors)

        expect(spy).toBeCalledTimes(expectedMaxRetries)
        jest.clearAllTimers()
        setTimeout(done, 10)
      })
  })

  test('Should succeed after [teapot (418), service unavailable (503), signal error] and finally 200 OK', async (done) => {
    // Arrange
    const path = '/vary-responses-418-503-signal-200'
    const url = `${server.uri}${path}`
    const options = {}
    const errors = []
    const retryOptions = {
      statusCodes: 200,
      maxRetries: 5,
      signalTimeout: 100,
      retryTimeout: 100,
      retryCodes: [418, 502],
      errors
    }

    const expectedStatusCode = 200
    const expectedText = 'OK'
    const expectedMaxRetries = 4
    const expectedErrors = [
      'FetchWithRetryError: Response.status: <418>, not in expected statusCodes: <[200]> attempt: <1>, willRetry: <true>.',
      'FetchWithRetryError: Response.status: <503>, not in expected statusCodes: <[200]> attempt: <2>, willRetry: <true>.',
      'AbortError: The user aborted a request.'
    ]

    // Mock Responses
    server.mockRequestPathResponses(
      path,
      // teapot
      () => {
        return {
          statusCode: 418,
          body: ''
        }
      },
      // service unavailable
      () => {
        return {
          statusCode: 503,
          body: ''
        }
      },
      // signal error
      async () => {
        await sleep(200)
        return {
          statusCode: 408,
          body: ''
        }
      },
      // ok
      async () => {
        return {
          statusCode: 200,
          body: 'OK'
        }
      }
    )

    // Act and Assert
    fetchWithRetry(url, options, retryOptions)
      .then(async (response) => {
        const text = await response.text()
        expect(text).toEqual(expectedText)
        expect(response.status).toEqual(expectedStatusCode)

        expect(spy).toBeCalledTimes(expectedMaxRetries)

        const resultErrors = errors.map(err => err.toString())
        expect(resultErrors).toEqual(expectedErrors)

        jest.clearAllTimers()
        setTimeout(done, 10)
      })
  })
})
