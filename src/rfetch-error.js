export default function RFetchError (message) {
  Error.call(this, message)
  this.message = message

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor)
}

RFetchError.prototype = Object.create(Error.prototype)
RFetchError.prototype.constructor = RFetchError
RFetchError.prototype.name = 'RFetchError'
