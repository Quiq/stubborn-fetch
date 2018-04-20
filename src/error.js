// @flow
import ExtendableError from 'extendable-error-class';

export class StubbornFetchError extends ExtendableError {
  data: {
    response?: Response,
    errorLimit: ?number,
    underlyingError?: Error,
  };
  type: string;

  static types = {
    TIMEOUT: 'Timeout',
    MAX_ERROS_EXCEEDED: 'Max_Errors_Exceeded',
    NETWORK_ERROR: 'Network',
    STUBBORN_FETCH_DISABLED: 'Stubborn_Fetch_Disabled',
    HTTP_ERROR: 'HTTP',
    RATE_LIMITED: 'Rate_Limited',
  };

  constructor(type: string, message: ?string, data: Object = {}) {
    super(message || type);
    this.type = type;
    this.data = data;
  }
}

export const ErrorFactory = {
  TIMEOUT: () => new StubbornFetchError(StubbornFetchError.types.TIMEOUT),
  MAX_ERRORS_EXCEEDED: (errorLimit: number) =>
    new StubbornFetchError('Max_Errors_Exceeded', null, {errorLimit}),
  NETWORK_ERROR: (underlyingError: Error) =>
    new StubbornFetchError('Network', null, {underlyingError}),
  STUBBORN_FETCH_DISABLED: () => new StubbornFetchError('Stubborn_Fetch_Disabled'),
  HTTP_ERROR: (response: Response) => new StubbornFetchError('HTTP', null, {response}),
  RATE_LIMITED: () => new StubbornFetchError('Rate_Limited'),
};

export default StubbornFetchError;
