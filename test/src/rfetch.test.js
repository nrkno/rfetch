/* global beforeEach, afterEach, describe, expect, jest, test */
/**
 * @jest-environment node
 */
import nock from 'nock'

import AbortContext from '../../src/abort-context.js'
import fetchImpl from '../../src/impl/fetch-impl.js'
import { definitions as rfetchDefinitions, rfetch } from '../../src/rfetch.js'
import delay from '../common/delay.js'

describe('rfetch', () => {
  let fetchSpy
  let abortSpy
  let scheduleSpy

  beforeEach(() => {
    abortSpy = jest.spyOn(AbortContext, 'create')
    scheduleSpy = jest.spyOn(rfetchDefinitions, 'retryFetchLoopSchedule')
    fetchSpy = jest.spyOn(fetchImpl.definitions, 'fetch')
  })

  afterEach(() => {
    abortSpy.mockRestore()
    scheduleSpy.mockRestore()
    fetchSpy.mockRestore()
  })

  test('Should fail after 5 consecutive 503 (service unavailable) responses', async (done) => {
    // Arrange
    const url = `http://localhost/unavailable`
    const options = {}
    const context = {
      errors: []
    }
    const signalTimeout = 1000
    const retryOptions = {
      signalTimeout,
      retries: 5,
      retryTimeout: [ 100, 200 ], // should loop over these
      context
    }

    const expectedRetries = 5
    const expectedErrors = [
      'RFetchError: Response.status: <503>, not in resolveOn: <[200]> status codes, attempt: <1> of: <5> retries, willRetry: <true>.',
      'RFetchError: Response.status: <503>, not in resolveOn: <[200]> status codes, attempt: <2> of: <5> retries, willRetry: <true>.',
      'RFetchError: Response.status: <503>, not in resolveOn: <[200]> status codes, attempt: <3> of: <5> retries, willRetry: <true>.',
      'RFetchError: Response.status: <503>, not in resolveOn: <[200]> status codes, attempt: <4> of: <5> retries, willRetry: <true>.',
      'RFetchError: Response.status: <503>, not in resolveOn: <[200]> status codes, attempt: <5> of: <5> retries, willRetry: <false>.'
    ]

    // Mock http calls
    for (let i = 0; i < expectedRetries; i++) {
      nock('http://localhost')
        .get('/unavailable')
        .reply(503, '')
    }

    // Act
    try {
      await rfetch(url, options, retryOptions)
    } catch (e) {
    // Assert
      const resultErrors =
        context.errors.map(err => err.toString())

      expect(resultErrors).toEqual(expectedErrors)
      expect(fetchSpy).toBeCalledTimes(expectedRetries)

      expect(scheduleSpy.mock.calls[0][0]).toBe(100)
      expect(scheduleSpy.mock.calls[1][0]).toBe(200)
      expect(scheduleSpy.mock.calls[2][0]).toBe(100)
      expect(scheduleSpy.mock.calls[3][0]).toBe(200)

      expect(abortSpy.mock.calls[0][0]).toBe(signalTimeout)
      expect(abortSpy.mock.calls[1][0]).toBe(signalTimeout)
      expect(abortSpy.mock.calls[2][0]).toBe(signalTimeout)
      expect(abortSpy.mock.calls[3][0]).toBe(signalTimeout)
      expect(abortSpy.mock.calls[4][0]).toBe(signalTimeout)
      done()
    }
  })

  test('Should fail after 3 varying http error, two are in the retryStatusCodes while the last is not', async (done) => {
    const url = `http://localhost/vary-error-responses-503-408-400`
    const options = {}
    const context = {
      errors: []
    }

    const signalTimeout = 1000
    const retryOptions = {
      retries: 5,
      retryOn: [ 503, 408 ],
      context
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

    const expectedRetries = 3
    const expectedErrors = [
      'RFetchError: Response.status: <503>, is in retryOn: <[503, 408]> status codes, attempt: <1> of: <5> retries, willRetry: <true>.',
      'RFetchError: Response.status: <408>, is in retryOn: <[503, 408]> status codes, attempt: <2> of: <5> retries, willRetry: <true>.',
      'RFetchError: Response.status: <400>, not in retryOn: <[503, 408]> status codes, attempt: <3> of: <5> retries, willRetry: <false>.'
    ]

    // Act
    try {
      await rfetch(url, options, retryOptions)
    } catch (e) {
    // Assert
      const resultErrors =
        context.errors.map(err => err.toString())

      expect(resultErrors).toEqual(expectedErrors)

      expect(fetchSpy).toBeCalledTimes(expectedRetries)
      expect(scheduleSpy.mock.calls[0][0]).toBe(100)
      expect(scheduleSpy.mock.calls[1][0]).toBe(100)

      expect(abortSpy.mock.calls[0][0]).toBe(signalTimeout)
      expect(abortSpy.mock.calls[1][0]).toBe(signalTimeout)
      expect(abortSpy.mock.calls[2][0]).toBe(signalTimeout)
      done()
    }
  })

  test('Should succeed after the http following codes: [ 503, 408, 418 ], with statusCode: 200', async (done) => {
    // Arrange
    const path = '/vary-responses-503-408-418-200'
    const url = `http://localhost${path}`
    const options = {}
    const context = {}

    const signalTimeout = 500
    const retryOptions = {
      signalTimeout: 500,
      retries: 5,
      retryTimeout: [100, 250, 300],
      context
    }

    const expectedRetries = 4
    const expectedStatusCode = 200
    const expectedErrors = [
      'RFetchError: Response.status: <503>, not in resolveOn: <[200]> status codes, attempt: <1> of: <5> retries, willRetry: <true>.',
      'RFetchError: Response.status: <408>, not in resolveOn: <[200]> status codes, attempt: <2> of: <5> retries, willRetry: <true>.',
      'RFetchError: Response.status: <418>, not in resolveOn: <[200]> status codes, attempt: <3> of: <5> retries, willRetry: <true>.'
    ]

    // Mock http calls
    const responses = [
      [ 503, '' ], // service unavailable
      [ 408, '' ], // request timeout
      [ 418, '' ], // teapot
      [ 200, 'OK' ]
    ]

    for (const response of responses) {
      nock('http://localhost')
        .get(path)
        .reply(() => response)
    }

    // Act
    const response = await rfetch(url, options, retryOptions)
    const resultErrors =
      context.errors.map(err => err.toString())

    // Assert
    expect(resultErrors).toEqual(expectedErrors)
    expect(response.status).toEqual(expectedStatusCode)

    expect(fetchSpy).toBeCalledTimes(expectedRetries)

    expect(scheduleSpy.mock.calls[0][0]).toBe(100)
    expect(scheduleSpy.mock.calls[1][0]).toBe(250)
    expect(scheduleSpy.mock.calls[2][0]).toBe(300)

    expect(abortSpy.mock.calls[0][0]).toBe(signalTimeout)
    expect(abortSpy.mock.calls[1][0]).toBe(signalTimeout)
    expect(abortSpy.mock.calls[2][0]).toBe(signalTimeout)
    done()
  })

  test('Should succeed after retryStatusCode: 408 on statusCode: 304', async (done) => {
    // Arrange
    const path = '/vary-responses-408-304-418'
    const url = `http://localhost${path}`
    const options = {}
    const context = {}
    const signalTimeout = 250
    const retryTimeout = 125
    const retryOptions = {
      signalTimeout,
      retryTimeout,
      resolveOn: 304,
      retries: 5,
      context
    }

    const expectedRetries = 2
    const expectedStatusCode = 304
    const expectedError = 'RFetchError: Response.status: <408>, not in resolveOn: <[304]> status codes, attempt: <1> of: <5> retries, willRetry: <true>.'

    // Mock http calls
    const responses = [
      [408, ''], // request timeout
      [304, ''], //
      [418, ''] // teapot
    ]

    for (const response of responses) {
      nock('http://localhost')
        .get(path)
        .reply(() => response)
    }

    // Act
    const response = await rfetch(url, options, retryOptions)
    // Assert
    expect(context.errors[0].toString()).toEqual(expectedError)
    expect(response.status).toEqual(expectedStatusCode)

    expect(fetchSpy).toBeCalledTimes(expectedRetries)

    expect(scheduleSpy.mock.calls[0][0]).toBe(retryTimeout)

    expect(abortSpy.mock.calls[0][0]).toBe(signalTimeout)
    expect(abortSpy.mock.calls[1][0]).toBe(signalTimeout)
    done()
  })

  test('Should fail after uses cancels via context.abortController sequence [503, 408, cancel] ', async (done) => {
    // Arrange
    const path = '/vary-responses-503-408-cancel'
    const url = `http://localhost${path}`
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

    const expectedRetries = 3
    const expectedErrors = [
      'RFetchError: Response.status: <503>, not in resolveOn: <[200]> status codes, attempt: <1> of: <3> retries, willRetry: <true>.',
      'RFetchError: Response.status: <408>, not in resolveOn: <[200]> status codes, attempt: <2> of: <3> retries, willRetry: <true>.',
      'AbortError: The user aborted a request.'
    ]

    // Mock http calls
    const responses = [
      // service unavailable
      (uri, rb, cb) => cb(null, [503, '']),
      // request timeout
      (uri, rb, cb) => cb(null, [408, '']),
      // teapot
      async (uri, rb, cb) => {
        await delay(100)
        return cb(null, [418, ''])
      },
      // ok
      (uri, rb, cb) => cb(null, [200, ''])
    ]

    for (const response of responses) {
      nock('http://localhost')
        .get(path)
        .reply(response)
    }

    // Act
    try {
      await rfetch(url, options, retryOptions)
    } catch (error) {
      // Assert
      const resultErrors =
        context.errors.map(err => err.toString())

      expect(resultErrors).toEqual(expectedErrors)
      expect(fetchSpy).toBeCalledTimes(expectedRetries)
      done()
    }
  })
})
