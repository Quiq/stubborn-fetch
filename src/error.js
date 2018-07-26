// @flow
import ExtendableError from 'extendable-error-class';

type ErrorData = {
  url: string,
  request: Object,
  response?: Response,
  errorLimit?: number,
  underlyingError?: Error,
};

export class StubbornFetchError extends ExtendableError {
  data: ErrorData;
  type: string;

  static types = {
    TIMEOUT: 'Timeout',
    MAX_ERROS_EXCEEDED: 'Max_Errors_Exceeded',
    NETWORK_ERROR: 'Network',
    STUBBORN_FETCH_DISABLED: 'Stubborn_Fetch_Disabled',
    HTTP_ERROR: 'HTTP',
    RATE_LIMITED: 'Rate_Limited',
  };

  constructor(type: string, data: ErrorData, message: ?string) {
    super(message || type);
    this.type = type;
    this.data = data;
  }
}

export const ErrorFactory = {
  TIMEOUT: (url: string, request: Object) =>
    new StubbornFetchError(StubbornFetchError.types.TIMEOUT, {url, request}),
  MAX_ERRORS_EXCEEDED: (url: string, request: Object, errorLimit: number) =>
    new StubbornFetchError('Max_Errors_Exceeded', {errorLimit, url, request}),
  NETWORK_ERROR: (url: string, request: Object, underlyingError: Error) =>
    new StubbornFetchError('Network', {underlyingError, url, request}),
  STUBBORN_FETCH_DISABLED: (url: string, request: Object) =>
    new StubbornFetchError('Stubborn_Fetch_Disabled', {url, request}),
  HTTP_ERROR: (url: string, request: Object, response: Response) =>
    new StubbornFetchError('HTTP', {response, url, request}),
  RATE_LIMITED: (url: string, request: Object) =>
    new StubbornFetchError('Rate_Limited', {url, request}),
};

export default StubbornFetchError;
