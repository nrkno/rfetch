/* global beforeAll, afterAll, afterEach, describe, expect, jest, test */
/**
 * @jest-environment node
 */
import sleep from '../../src/sleep.js'
import server from '../server.js'
global.fetch = require('whatwg-fetch').fetch
global.Promise = require('es6-promise').Promise
global.AbortController = require('abort-controller')

const fetchWithRetry = require('../../impl/window/index.js')

describe('fetch with retry for node', () => {
  beforeAll(async () => {
    try {
      await server.start(30004)
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

  afterEach(() => {
    server.clearMocks()
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
      retryCodes: [503, 408],
      errors
    }

    const expectedErrors = [
      'AbortError: Aborted',
      'FetchWithRetryError: Response.status: <503>, not in expected statusCodes: <[200]> attempt: <2>, willRetry: <true>.',
      'AbortError: Aborted',
      'FetchWithRetryError: Response.status: <408>, not in expected statusCodes: <[200]> attempt: <4>, willRetry: <true>.',
      'AbortError: Aborted'
    ]

    // Mock Responses
    server.mockRequestPathResponses(
      path,
      // signal (slow network)
      async () => {
        await sleep(200)
        return {
          statusCode: 501,
          body: '',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      },
      // service unavailable
      () => {
        return {
          statusCode: 503,
          body: '',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      },
      // signal (slow network)
      async () => {
        await sleep(200)
        return {
          statusCode: 503,
          body: '',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      },
      // request timeout
      async () => {
        return {
          statusCode: 408,
          body: '',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      },
      // ok
      async () => {
        await sleep(200)
        return {
          statusCode: 200,
          body: 'OK',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      }
    )

    // Act and Assert
    fetchWithRetry(url, options, retryOptions)
      .catch(() => {
        const resultErrors = errors.map(err => err.toString())
        expect(resultErrors).toEqual(expectedErrors)

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
    const expectedErrors = [
      'FetchWithRetryError: Response.status: <418>, not in expected statusCodes: <[200]> attempt: <1>, willRetry: <true>.',
      'FetchWithRetryError: Response.status: <503>, not in expected statusCodes: <[200]> attempt: <2>, willRetry: <true>.',
      'AbortError: Aborted'
    ]

    // Mock Responses
    server.mockRequestPathResponses(
      path,
      // teapot
      () => {
        return {
          statusCode: 418,
          body: '',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      },
      // service unavailable
      () => {
        return {
          statusCode: 503,
          body: '',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      },
      // signal error
      async () => {
        await sleep(200)
        return {
          statusCode: 408,
          body: '',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      },
      // ok
      async () => {
        return {
          statusCode: 200,
          body: 'OK',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      }
    )

    // Act and Assert
    fetchWithRetry(url, options, retryOptions)
      .then(async (response) => {
        const text = await response.text()
        expect(text).toEqual(expectedText)
        expect(response.status).toBe(expectedStatusCode)

        const resultErrors = errors.map(err => err.toString())
        expect(resultErrors).toEqual(expectedErrors)

        jest.clearAllTimers()
        setTimeout(done, 10)
      })
  })
})
