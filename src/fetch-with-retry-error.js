export default function FetchWithRetryError (message) {
  Error.call(this, message)
  this.message = message

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor)
}

FetchWithRetryError.prototype = Object.create(Error.prototype)
FetchWithRetryError.prototype.constructor = FetchWithRetryError
FetchWithRetryError.prototype.name = 'FetchWithRetryError'
