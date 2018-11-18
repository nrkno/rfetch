const http = require('http')
const url = require('url')

let server
let uri
const paths = new Map()

function clearMocks () {
  paths.clear()
}

function mockRequestPathResponse (path, mockResponse) {
  mockRequestPathResponses(path, [mockResponse])
}

function mockRequestPathResponses (path, ...mockResponses) {
  paths.set(
    path,
    mockResponses
  )
}

async function requestListener (req, res) {
  const path = url.parse(req.url).pathname
  if (!paths.has(path)) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain')
    res.end('')
    return
  }

  const mockResponses = paths.get(path)
  if (mockResponses.length === 0) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain')
    res.end('no-mock-response')
    return
  }

  const mockResponse = mockResponses.shift()
  const response = typeof mockResponse === 'function'
    ? await mockResponse()
    : mockResponse

  if (!response) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain')
    res.end('no-mock-response')
    return
  }

  // console.log('send response', response)
  res.statusCode = response.statusCode
  if (response.headers) {
    try {
      for (const key of Object.keys(response.headers)) {
        res.setHeader(key, response.headers[key])
      }
    } catch (e) {}
  }

  res.end(response.body)
}

async function start (port, hostname = 'localhost') {
  return new Promise((resolve, reject) => {
    server = http.createServer(requestListener)
    uri = `http://${hostname}:${port}`

    server.on('error', err => console.error(err))
    server.listen(port, hostname, err => err ? reject(err) : resolve())
  })
}

async function stop () {
  return new Promise((resolve, reject) => {
    server.close((err) => err ? reject(err) : resolve())
  })
}

module.exports = {
  clearMocks,
  mockRequestPathResponse,
  mockRequestPathResponses,
  start,
  stop,

  get uri () {
    return uri
  }
}
