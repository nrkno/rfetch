export interface RetryOptionsContext {
  /**
   * The global abortController associated with the retry fetch loop,
   * Set internally onto this context object by the retry fetch loop.
   */
  abortController: AbortController;
  /**
   * An array of errors (by reference), that allows us to inspect all the error(s)
   * that were thrown in the retry loop for further processing etc.
   */
  errors?: Error[],
  /**
   * A sink function (by reference), for different phases in the retry fetch loop
   */
  sink?: (phase: string, context: Object) => void;
}

export interface RetryOptions {
  /**
   * The signal timeout before aborting the request in ms,
   * default value is 1000ms = 1s
   */
  signalTimeout?: number;
  /**
   * The status code(s) to resolve on,
   * default value is [ 200 ].
   */
  resolveOn?: number | number[];
  /**
   * The number of the times to retry,
   * default retries is 3.
   */
  retries?: number;
  /**
   * The retry timeout to delay before firing a new fetch request,
   * default value is 100ms.
   */
  retryTimeout?: number;
  /**
   * The status code(s) to retry on,
   * default value is empty set.
   */
  retryOn?: number | number[];
  /**
   * The retry options context for more advanced control options (by reference).
   */
  context?: RetryOptionsContext;
}

export default function rfetch(url: RequestInfo, options?: RequestInit, retryOptions?: RetryOptions): Promise<Response>;
