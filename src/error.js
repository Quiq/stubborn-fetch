// @flow
import ExtendableError from 'extendable-error-class';

type ErrorData = {
  url: string,
  fetchRequest: Object,
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
  TIMEOUT: (url: string, fetchRequest: Object) =>
    new StubbornFetchError(StubbornFetchError.types.TIMEOUT, {url, fetchRequest}),
  MAX_ERRORS_EXCEEDED: (url: string, fetchRequest: Object, errorLimit: number) =>
    new StubbornFetchError('Max_Errors_Exceeded', {errorLimit, url, fetchRequest}),
  NETWORK_ERROR: (url: string, fetchRequest: Object, underlyingError: Error) =>
    new StubbornFetchError('Network', {underlyingError, url, fetchRequest}),
  STUBBORN_FETCH_DISABLED: (url: string, fetchRequest: Object) =>
    new StubbornFetchError('Stubborn_Fetch_Disabled', {url, fetchRequest}),
  HTTP_ERROR: (url: string, fetchRequest: Object, response: Response) =>
    new StubbornFetchError('HTTP', {response, url, fetchRequest}),
  RATE_LIMITED: (url: string, fetchRequest: Object) =>
    new StubbornFetchError('Rate_Limited', {url, fetchRequest}),
};

export default StubbornFetchError;
