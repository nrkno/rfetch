# README

RFetch - Fetch With Retry


## Dependencies and/or Polyfills

By Default we do not install any depencies, see the reuired depencies and/or polyfills needed for the intended target(s) of your choice below.

**Browser**

For web browser environment target you will need to have to polyfill the following builtin and API's if not present:

* [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) e.g. via [es6-promise](https://www.npmjs.com/package/es6-promise)
* [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) e.g. via [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch) also included by [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)).
* [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) e.g. via [abort-controller](https://www.npmjs.com/package/abort-controller)

__NOTE: You may want to only polyfill only what is needed depending on your target group browser compatibility needs.__

**Node**

For node environment you will need to install the following dependencies:

* [node-fetch](https://www.npmjs.com/package/node-fetch) (also included by [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch))
* [abort-controller](https://www.npmjs.com/package/abort-controller)


**Isomorphic**

If you intend to develop an isomorphic app where you target both the web and node targets, you will need to address the depencies litst above for each environment.
Also you may want to prefer to install the [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch), which both includes [node-fetch](https://www.npmjs.com/package/node-fetch) and  [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch.

## Dist
## Usage

TBD

- Options


## Bundling

TBD?

## TODO:

**Misc**
- Add typings
- More complete informations about how to use, and available options
- Should we add docs about bundling, may be outdated fast

**Tests**
- Automated tests for the dist/rfetch.web.js build via jest + puppeteer
- Fix tests for module (mjs) builds (@see https://github.com/facebook/jest/issues/4637)
