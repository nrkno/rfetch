# RFetch

Fetch With Retry

## Installation

node:

```
$ npm install @nrk/rfetch
```

## Usage

```js
const rfetch = require('@nrk/rfetch')
const url = 'http://example.com/api/endpoint'

/*
  For a more comprenhensive API reference for the fetchOptions see:

  - https://github.github.io/fetch/
  - https://github.com/bitinn/node-fetch
*/
const fetchOptions = {
  method: 'GET',
  ...
}

const retryOptions = {
  /*
   Optional signalTimeout in ms, how long before each fetch request should timeout.
   The default timeout is 1000ms = 1 second.
  */
  signalTimeout: 1000,

  /*
    Optional resolveOn, can be a single http status code or various http status codes.
    In most use cases we would want to resolve on one given http status.
    The default status code we try to resolve on is http status = 200 OK.
  */
  resolveOn: 200,

  /*
    How many retries before failing.
    The default value is 3 retries to attempt to fetch given url.
  */
  retries: 3,

  /*
    Retry timeout, can be a single timeout number or various timeout numbers to loop over.
    The default value is 100ms, which is how long it should delay before retrying a new fetch request.
  */
  retryTimeout: 100,

  /*
    Which http status codes to retry on, can be a single http status code or various http status codes.
    The deault values is an empty set, and the retry heuristic will retry on every http status code that
    does not match the http status codes to match on.
   */
  retryOn: [],

  /*
    Optional context object for more advanced controls
  */
  context: {
    /*
      The abortController property will be set internally, and is an instance of AbortController.
      This allows you to call it's abort() method, and stop the entire retry fetch loop.
    */
    abortController: null,

    /*
      Optional errors array (by reference), that allows us to inspect all the error(s)
      that were thrown in the retry loop for further processing etc.
    */
    errors: [],

    /*
      Optional sink callback (by reference), that allows us to listen to some of the phases in the
      retry fetch loop and eventually do some code based on the different phases.
     */
    sink (phase, context) {
      if (phase === 'rfetch.fetch.(start|resolved|rejected)') {
        ...
      }
    }
  }
}

try {
  const response = await rfetch(options, fetchOptions, retryOptions)
  const data = await response.json()
} catch (err) {
  console.error(err)
}
```

__Note: both the `fetchOptions` and `retryOptions` are optional, and the retry options will default to values explained above__

The `context.abortController` is set internally by the retry fetch loop and allows you to abort the retry loop,
since it will abort the current fetch request in the loop via it's assigned abort controller.

**ResolveOn and RetryOn heuristics**

The `resolveOn` and `retryOn` can be one or more http status codes respectively.

1. Success example - expect response.status = 200 and no retry on value(s) set

```js
const retryOptions = {
  retries: 3,
  resolveOn: 200
}

fetch -> http 503 -> retry
fetch -> http 408 -> retry
fetch -> http 200 -> success -> resolve
```

2. Success example - expect response.status in [ 200, 204 ] and no retry on value(s) set

```js
const retryOptions = {
  retries: 3,
  resolveOn: [ 200, 204 ]
}

fetch -> http 418 -> retry
fetch -> http 204 -> success -> resolve
```

3. Success example - expect response.status = 200 and retry on = 503

```js
const retryOptions = {
  retries: 3,
  resolveOn: 200,
  retryOn: 503
}

fetch -> http 503 -> retry
fetch -> http 200 -> success -> resolve
```

4. Success example - expect response.status = 200 and retry on = [ 503, 408 ]

```js
const retryOptions = {
  retries: 3,
  resolveOn: 200,
  retryOn: [ 503, 408 ]
}

fetch -> http 503 -> retry
fetch -> http 408 -> retry
fetch -> http 200 -> success -> resolve
```

5. Failure example, expect esponse.status = 200 and retry on = [ 503, 408 ].
```js
const retryOptions = {
  retries: 3,
  resolveOn: 200,
  retryOn: [ 503, 408 ]
}

fetch -> http 503 -> retry
fetch -> http 418 -> failure -> reject
```

**Retry timeout heuristics**

The `retryTimeout` can either be a single timeout value that will be used as the default delay before starting a new fetch retry request.
Or it can be a set of timeout values that we loop over e.g.:

```js
const retryOptions = {
  retries: 5,
  retryTimeout: [100, 200]
}

fetch -> failure -> delay 100
fetch -> failure -> delay 200
fetch -> failure -> delay 100
fetch -> failure -> delay 200
fetch ...
```

Or you can specify for each retry:

```js
const retryOptions = {
  retries: 4,
  retryTimeout: [100, 250, 300]
}

fetch -> failure -> delay 100
fetch -> failure -> delay 250
fetch -> failure -> delay 300
fetch ...
```

**Signal and aborting the fetch retry loop**

The following code will not work as expected e.g.:

```js
let abortController
cancelButton.addEventListener('click',
  // this will not work as expected
  () => abortController.abort()
)

dataButton.addEventLister('click', async () => {
  abortController = new AbortController()
  const fetchOptions = {
    signal: abortController.signal
  }

  try {
    const response = await rfetch('/api/data', fetchOptions)
    ....
  } catch (e) {
    // will never be aborted by the abortController if the user click's the abort button
  }
})
```

The retry fetch loop will not be aborted (rejected) by the user input as one would expect.
If you need to cancel the retry fetch loop you need to pass a context object with the retryOptions e.g.:

```js
const retryOptions = {
  /* by reference */
  context: {}
}

cancelButton.addEventListener('click',
  () => retryOptions.context.abortController.abort()
)

dataButton.addEventLister('click', async () => {
  try {
    const response = await rfetch('/api/data', {}, retryOptions)
    ....
  } catch (e) {
     // will be avorted by the if the user click's the abort button
  }
})
```

**Sink phases**

You can pass a context object with the `retryOptions`, that allows you to pass a sink method by reference to listen to some of the phases in the retry fetch loop e.g.:

```js
function sink (phase, context) {
  if (phase === 'rfetch.fetch.start') {
    console.log(`Start a fetch request url: <(${context.url})>, attempt: <${context.n}> of: <${context.retries}>.`)
  }

  if (phase === 'rfetch.fetch.rejected') {
    console.log(`Failure to fetch request url: <(${context.url})>, attempt: <${context.n}> of: <${context.retries}>, error: <${context.error.toString()}>.`)
  }

  if (phase === 'rfetch.fetch.resolved') {
    console.log(`Succeeded to fetch request url: <(${context.url})>, attempt: <${context.n}> of: <${context.retries}>.`)
  }
}

const url = 'http://example.com/api/endpoint'
const fetchOptions = {
  ...
}
const retryOptions = {
  context: {
    sink
  }
}


try {
  const response = await rfetch(url, fetchOptions, retryOptions)
} catch (error) {
  ...
}

```

**Module Support**

We support es6 modules e.g. the following code would also work:

```js
import rfetch from '@nrk/rfetch'

const url = 'http://example.com/api/endpoint'
const fetchOptions = {
  ...
}
const retryOptions = {
  ...
}


try {
  const response = await rfetch(url, fetchOptions, retryOptions)
} catch (error) {
  ...
}
```

Bundlers such as [browserify](http://browserify.org/) and [rollup](https://rollupjs.org/guide/en), [webpack](https://webpack.js.org/) will lookup the corresponding `.mjs` file, also the latest node works has module support behind the [`--experimental-modules`](https://nodejs.org/api/esm.html) flag.

## Dependencies and/or Polyfills

By Default we do not install any depencies, see the reuired depencies and/or polyfills needed for the intended target(s) of your choice below.

**Node**

For node environment you will need to install the following dependencies:

* [node-fetch](https://www.npmjs.com/package/node-fetch) (also included by [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch))
* [abort-controller](https://www.npmjs.com/package/abort-controller)


**Browser**

For web browser environment target you will need to have to polyfill the following builtin and API's if not present:

* [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) e.g. via [es6-promise](https://www.npmjs.com/package/es6-promise)
* [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) e.g. via [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch) also included by [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)).
* [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) e.g. via [abort-controller](https://www.npmjs.com/package/abort-controller)

__NOTE: You may want to only polyfill only what is needed depending on your target group browser compatibility needs.__


**Isomorphic**

If you intend to develop an isomorphic app where you target both the web and node targets, you will need to address the depencies litst above for each environment.
Also you may want to prefer to install the [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch), which both includes [node-fetch](https://www.npmjs.com/package/node-fetch) and  [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch).

Bundlers such as [browserify](http://browserify.org/), [rollup](https://rollupjs.org/guide/en) and [webpack](https://webpack.js.org/) will lookup the `main`, `module` and `browser` fields in the package.json to lookup the corresponding file to use for the given target either it be node or browser.

## Dist

A minified [umd](https://github.com/umdjs/umd) module for web, is provided under the `dist` folder, as `dist/rfetch.web.min.js` with a corresponding source map file.
It exports `rfetch` on to the window
