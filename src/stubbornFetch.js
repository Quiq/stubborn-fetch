// @flow

import 'isomorphic-fetch';
import {ErrorFactory, StubbornFetchError} from './error';
import type {Logging} from '../types';

const TimingFunctions = {
  exponential: c => (c ** 2 - 1) / 2 * 1000,
  constant: () => 1000,
};

/**
 * @property timingFunction - A function of the (form retryCount : delay in ms) to determine how long to wait between retries.
 * Default to exponential backoff.
 * @property maxDelay - The maximum delay in ms between requests (upper bound on `timingFunction`)
 * @property totalRequestTimeLimit - The time limit across all retries of this request, after which the request will fail.
 * @property retries - How many times to attempt a request.
 * @property minimumStatusCodeForRetry - The lowest HTTP status code for which we will retry a request.
 * @property unretryableStatusCodes - An array of status code numbers for which we will never retry a request, even if it's above the `minimumStatusCodeForRetry`.
 * @property retryOnNetworkFailure - Whether we should retry a request when it fails due to a network issue, i.e. we did not get any response from server.
 * @property maxErrors - The maximum global error count we will tolerate across ALL requests. After this is hit, NO future requests will be sent.
 * @property onError - A function that will be called when a request attempt fails.
 * @property shouldRetry - Called for determining whether a retry attempt should occur. Takes precedence over other retry-related options.
 * @property logger - A class or object conforming to the `Logging` interface which we'll use for logging out request information and events.
 * Defaults to `console`
 */
export type StubbornFetchRequestOptions = {
  timingFunction: string,
  maxDelay: number,
  totalRequestTimeLimit?: number,
  retries: number,
  minimumStatusCodeForRetry: number,
  unretryableStatusCodes: Array<number>,
  retryOnNetworkFailure: boolean,
  maxErrors?: number,
  onError?: (error: StubbornFetchError) => void,
  shouldRetry?: (error: StubbornFetchError, retries: number) => boolean,
  logger?: Logging,
};

/**
 * A retry wrapper around the Fetch API.
 */
class StubbornFetchRequest {
  static globalErrorCount: number = 0;
  static enabled: boolean = true;

  static disable() {
    this.enabled = false;
  }

  static enable() {
    this.enabled = true;
  }

  static rateLimitedUntil: ?number = null;

  options: StubbornFetchRequestOptions = {
    timingFunction: 'exponential',
    maxDelay: 60000,
    debug: false,
    retries: 3,
    minimumStatusCodeForRetry: 400,
    unretryableStatusCodes: [401, 403, 422],
    retryOnNetworkFailure: false,
  };

  logger: Logging;

  url: string;
  fetchRequest: Object;
  reqId = new Date().getTime();
  startTime: number;

  attemptCount = 0;
  error: ?StubbornFetchError;
  requestTimer: ?TimeoutID;
  rejectImmediately: (error: StubbornFetchError) => void;

  constructor(url: string, fetchRequest: ?Object, optionOverrides: ?Object = {}) {
    this.options = Object.assign({}, this.options, optionOverrides);
    this.logger = this.options.logger || console;
    this.url = url;
    this.fetchRequest = fetchRequest || {};
    this.error =
      typeof this.options.maxErrors === 'number' &&
      StubbornFetchRequest.globalErrorCount >= this.options.maxErrors
        ? ErrorFactory.MAX_ERRORS_EXCEEDED(this.url, this.fetchRequest, this.options.maxErrors)
        : null;
  }

  _log(level: 'error' | 'warn' | 'info' | 'debug' | 'log', message: string, data: ?Object) {
    const log = this.logger[level] || this.logger.log;
    const method = (this.fetchRequest && this.fetchRequest.method) || 'get';
    const logString = `${message.toUpperCase()}: [${method.toUpperCase()} ${this.url}]`;
    if (data) {
      log(logString, data);
    } else {
      log(logString);
    }
  }

  _startRequestTimer() {
    if (this.options.totalRequestTimeLimit) {
      this.requestTimer = setTimeout(() => {
        this.error = ErrorFactory.TIMEOUT(this.url, this.fetchRequest);
        this.rejectImmediately(this.error);
      }, this.options.totalRequestTimeLimit);
    }
  }

  _canRetry(error: StubbornFetchError): boolean {
    // If this request has already permanently failed, we definitely cannot retry
    if (this.error) {
      return false;
    }

    // Defer to downstream shouldRetry function if one was provided
    if (this.options.shouldRetry) {
      return this.options.shouldRetry(error, this.attemptCount);
    }

    let errorIsRetryable: boolean;
    switch (error.type) {
      case 'Network':
        errorIsRetryable = this.options.retryOnNetworkFailure;
        break;
      case 'HTTP': {
        const status = error.data.response && error.data.response.status;
        errorIsRetryable =
          typeof status === 'number' &&
          !this.options.unretryableStatusCodes.includes(status) &&
          status >= this.options.minimumStatusCodeForRetry;
        break;
      }
      default:
        errorIsRetryable = false;
        break;
    }

    return (
      errorIsRetryable && (this.options.retries === -1 || this.attemptCount < this.options.retries)
    );
  }

  _requestGuard() {
    // Is StubbornFetch disabled?
    if (!StubbornFetchRequest.enabled) {
      throw ErrorFactory.STUBBORN_FETCH_DISABLED(this.url, this.fetchRequest);
    }

    // Has global error limit been reached?
    if (
      typeof this.options.maxErrors === 'number' &&
      StubbornFetchRequest.globalErrorCount > this.options.maxErrors
    ) {
      this.error = ErrorFactory.MAX_ERRORS_EXCEEDED(
        this.url,
        this.fetchRequest,
        this.options.maxErrors,
      );
    }

    // Has current request permanently failed already?
    if (this.error) {
      throw this.error;
    }
  }

  _delayIfNeeded(): Promise<*> {
    // NOTE: We pad the rate limit time by 100ms just to be safe and not get rate limited again
    // Since this can be negative, if `rateLimitUntil` time has already been passed, we take max w.r.t. 0
    const delayDueToRateLimiting = Math.max(
      StubbornFetchRequest.rateLimitedUntil
        ? StubbornFetchRequest.rateLimitedUntil - Date.now() + 100
        : 0,
      0,
    );

    // NOTE: We want whichever is longer, the rate limit time or the result of the backoff function.
    // NOTE: The delay due to rate limiting is not subject to clamping
    const delay = Math.max(
      delayDueToRateLimiting,
      // Clamp (0, number, maxDelay)
      Math.max(
        0,
        Math.min(
          TimingFunctions[this.options.timingFunction](this.attemptCount),
          this.options.maxDelay,
        ),
      ),
    );
    return new Promise(resolve => {
      if (delay > 0) {
        this._log('debug', `delay retry for ${delay} ms`);
      }
      window.setTimeout(resolve, delay);
    });
  }

  _handleError(e: StubbornFetchError) {
    StubbornFetchRequest.globalErrorCount++;
    if (
      typeof this.options.maxErrors === 'number' &&
      StubbornFetchRequest.globalErrorCount >= this.options.maxErrors
    ) {
      this.error = ErrorFactory.MAX_ERRORS_EXCEEDED(
        this.url,
        this.fetchRequest,
        this.options.maxErrors,
      );
    }

    // Error-specific logic
    if (e.type === 'HTTP' && e.data.response) {
      switch (e.data.response.status) {
        case 401:
          this._log('warn', '401 received', {response: e.data.response});
          break;
        case 429:
          this._log('warn', 'rate limited', {response: e.data.response});

          // Adjust next retry time if response headers give us some hints
          if (
            e.data.response &&
            e.data.response.headers &&
            e.data.response.headers.get('Retry-After')
          ) {
            StubbornFetchRequest.rateLimitedUntil =
              // $FlowIssue - We've already confirmed that headers object exists
              Date.now() + parseInt(e.data.response.headers.get('Retry-After'), 10) * 1000;

            // Does this push us beyond the time limit?
            if (
              this.options.totalRequestTimeLimit &&
              StubbornFetchRequest.rateLimitedUntil - this.startTime >
                this.options.totalRequestTimeLimit
            ) {
              this.error = ErrorFactory.RATE_LIMITED(this.url, this.fetchRequest);
              this.rejectImmediately(this.error);
            }
          }
          break;
      }
    }
  }

  async _doAttempt(): Promise<Response> {
    // Throw an error immediately if we need to...
    this._requestGuard();

    this.attemptCount++;

    // Backoff, man
    await this._delayIfNeeded();

    // Check for error again, in case some condition changed while we were delaying
    // For example, we might now be over the totalRequestTimeLimit limit
    this._requestGuard();

    let response;
    try {
      response = await fetch(this.url, this.fetchRequest);
    } catch (networkError) {
      const e = ErrorFactory.NETWORK_ERROR(this.url, this.fetchRequest, networkError);
      this._handleError(e);
      throw this.error || e;
    }

    // NOTE: fetch resolves if network request was successful, but doesn't consider status codes.

    /******** Request SUCCESS! **********/
    if (response.status < 400) {
      // Success--resolve promise and send response to caller
      return response;
    }

    /******** Request FAILURE :( **********/
    const e = ErrorFactory.HTTP_ERROR(this.url, this.fetchRequest, response);
    this._handleError(e);

    // If there is already an error defined on this whole request,
    // such as a timeout or max errors exceeded, throw this as it's more informative than the HTTP response.
    throw this.error || e;
  }

  async _runRequestLoop() {
    try {
      return await this._doAttempt();
    } catch (e) {
      if (this.options.onError) {
        this.options.onError(e);
      }

      // Retry if we can
      if (this._canRetry(e)) {
        return this._runRequestLoop();
      }

      // If we can't, then throw error (reject)
      throw e;
    }
  }

  async send(): Promise<Response> {
    this.startTime = Date.now();
    this._startRequestTimer();

    return new Promise((resolve, reject) => {
      this.rejectImmediately = reject;

      this._runRequestLoop()
        .then((response: Response) => {
          resolve(response);
        })
        .catch((error: StubbornFetchError) => {
          this._log('error', error.type, {error});
          reject(error);
        })
        // $FlowIssue - flow doesn't know about Promise.finally() yet
        .finally(() => {
          if (this.requestTimer) {
            clearTimeout(this.requestTimer);
          }
        });
    });
  }
}

export default StubbornFetchRequest;
