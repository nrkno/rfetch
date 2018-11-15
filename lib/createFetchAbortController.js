const sleep = require('sleep')

function createFetchAbortController (timeout) {
  const options = {
    controller: new AbortController(),
    completed: false
  }

  sleep(timeout).then (() => {
    // only abort if the response was not completed
    if (options.completed === false) {
      options.controller.abort()
    }
  })

  return options
}

module.exports = createFetchAbortController
