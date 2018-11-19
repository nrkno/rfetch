# README

RFetch - Fetch With Retry

- Node
- ES6 environments
- Browser


## Usage

TBD


## NPM Package Dependencies required to develop in node or browser env's

*Browser*

* [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch) (included by [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch))
* [abort-controller](https://www.npmjs.com/package/abort-controller)

*Node*
* [node-fetch](https://www.npmjs.com/package/node-fetch) (included by [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch))
* [abort-controller](https://www.npmjs.com/package/abort-controller)


## TODO:

**Misc**
- Add typings
- More complete informations about how to use, and available options

**Tests**
- Automated tests for the dist/rfetch.web.js build via jest + puppeteer
- Fix tests for module (mjs) builds (@see https://github.com/facebook/jest/issues/4637)
