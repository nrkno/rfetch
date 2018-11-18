/* global beforeAll, afterAll, afterEach, describe, expect, jest, test */
/**
 * @jest-environment node
 */
import sleep from '../../src/util/sleep.js'
import server from '../common/server.js'
import fetchWithRetry from '../../lib/index.js'

describe('fetch with retry for node', () => {
  beforeAll(async () => {
    try {
      await server.start(30003)
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

        const resultErrors = errors.map(err => err.toString())
        expect(resultErrors).toEqual(expectedErrors)

        jest.clearAllTimers()
        setTimeout(done, 10)
      })
  })
})
