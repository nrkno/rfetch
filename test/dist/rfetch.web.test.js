/* global beforeAll, afterAll, afterEach, describe, expect, test */
/**
 * @jest-environment jsdom
 */
import '../common/window.polyfill.js'
import delay from '../common/delay.js'
import server from '../common/server.js'
const rfetch = require('../../dist/rfetch.web.min.js')

describe('fetch with retry for node', () => {
  beforeAll(async () => {
    try {
      await server.start(30005)
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

  test('Should not have loaded the node-fetch implementation', () => {
    const keys = Object.keys(require.cache)
    const result = keys.find(key => /node_modules\/node-fetch/.test(key)) !== undefined
    expect(result).toBe(false)
  })

  test('Should fail after [signal error, 408, signal error, 503, signal error]', async (done) => {
    // Arrange
    const path = '/vary-responses-signal-408-signal-503-signal'
    const url = `${server.uri}${path}`
    const options = {}
    const context = {
      errors: []
    }
    const retryOptions = {
      resolveOn: 200,
      retries: 5,
      signalTimeout: 100,
      retryTimeout: 100,
      retryOn: [503, 408],
      context
    }

    const expectedErrors = [
      'AbortError: Aborted',
      'RFetchError: Response.status: <503>, is in retryOn: <[503, 408]> status codes, attempt: <2> of: <5> retries, willRetry: <true>.',
      'AbortError: Aborted',
      'RFetchError: Response.status: <408>, is in retryOn: <[503, 408]> status codes, attempt: <4> of: <5> retries, willRetry: <true>.',
      'AbortError: Aborted'
    ]

    // Mock Responses
    server.mockRequestPathResponses(
      path,
      // signal (slow network)
      async () => {
        await delay(200)
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
        await delay(200)
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
        await delay(200)
        return {
          statusCode: 200,
          body: 'OK',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      }
    )

    // Act
    try {
      await rfetch(url, options, retryOptions)
    } catch (e) {
      // Assert
      const resultErrors = context.errors.map(err => err.toString())
      expect(resultErrors).toEqual(expectedErrors)
      done()
    }
  })

  test('Should succeed after [teapot (418), service unavailable (503), signal error] and finally 200 OK', async (done) => {
    // Arrange
    const path = '/vary-responses-418-503-signal-200'
    const url = `${server.uri}${path}`
    const options = {}
    const context = {}
    const retryOptions = {
      resolveOn: 200,
      retries: 5,
      signalTimeout: 100,
      retryTimeout: 100,
      retryOn: [418, 408, 503],
      context
    }

    const expectedStatusCode = 200
    const expectedText = 'OK'
    const expectedErrors = [
      'RFetchError: Response.status: <418>, is in retryOn: <[418, 408, 503]> status codes, attempt: <1> of: <5> retries, willRetry: <true>.',
      'RFetchError: Response.status: <503>, is in retryOn: <[418, 408, 503]> status codes, attempt: <2> of: <5> retries, willRetry: <true>.',
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
        await delay(200)
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

    // Act
    const response = await rfetch(url, options, retryOptions)
    const text = await response.text()

    // Assert
    expect(text).toEqual(expectedText)
    expect(response.status).toEqual(expectedStatusCode)

    const resultErrors = context.errors.map(err => err.toString())
    expect(resultErrors).toEqual(expectedErrors)

    done()
  })

  test('Should fail after uses cancels via context.abortController sequence [503, 408, cancel] ', async (done) => {
    // Arrange
    const path = '/vary-responses-503-408-cancel'
    const url = `${server.uri}${path}`
    const options = {}

    // abort the sequence after the 408 response
    let cancel = false
    const context = {
      sink (phase, ctx) {
        if (phase === 'rfetch.fetch.rejected' && ctx.error.toString().includes('<408>, not in')) {
          cancel = true
        }

        if (phase === 'rfetch.fetch.start' && cancel) {
          cancel = false
          context.abortController.abort()
        }
      }
    }

    const retryOptions = {
      context
    }

    const expectedErrors = [
      'RFetchError: Response.status: <503>, not in resolveOn: <[200]> status codes, attempt: <1> of: <3> retries, willRetry: <true>.',
      'RFetchError: Response.status: <408>, not in resolveOn: <[200]> status codes, attempt: <2> of: <3> retries, willRetry: <true>.',
      'AbortError: Aborted'
    ]

    server.mockRequestPathResponses(
      path,
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
      // request timeout
      () => {
        return {
          statusCode: 408,
          body: '',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      },
      // teapot
      async () => {
        await delay(100)
        return {
          statusCode: 418,
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

    // Act
    try {
      await rfetch(url, options, retryOptions)
    } catch (error) {
      // Assert
      const resultErrors =
        context.errors.map(err => err.toString())

      expect(resultErrors).toEqual(expectedErrors)
      done()
    }
  })
})
