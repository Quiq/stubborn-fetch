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

const generateResponseObject = (statusText: string, url: string): Response =>
  (({
    headers: {},
    ok: false,
    redirected: undefined,
    status: 0,
    statusText,
    type: 'error',
    url,
    bodyUsed: false,
  }: any): Response);

export const ErrorFactory = {
  TIMEOUT: (url: string, request: Object) =>
    new StubbornFetchError(StubbornFetchError.types.TIMEOUT, {
      url,
      request,
      response: generateResponseObject(StubbornFetchError.types.TIMEOUT, url),
    }),
  MAX_ERRORS_EXCEEDED: (url: string, request: Object, errorLimit: number) =>
    new StubbornFetchError(StubbornFetchError.types.MAX_ERROS_EXCEEDED, {
      errorLimit,
      url,
      request,
      response: generateResponseObject(StubbornFetchError.types.MAX_ERROS_EXCEEDED, url),
    }),
  NETWORK_ERROR: (url: string, request: Object, underlyingError: Error) =>
    new StubbornFetchError(StubbornFetchError.types.NETWORK_ERROR, {
      underlyingError,
      url,
      request,
      response: generateResponseObject(StubbornFetchError.types.NETWORK_ERROR, url),
    }),
  STUBBORN_FETCH_DISABLED: (url: string, request: Object) =>
    new StubbornFetchError(StubbornFetchError.types.STUBBORN_FETCH_DISABLED, {
      url,
      request,
      response: generateResponseObject(StubbornFetchError.types.STUBBORN_FETCH_DISABLED, url),
    }),
  HTTP_ERROR: (url: string, request: Object, response: Response) =>
    new StubbornFetchError(StubbornFetchError.types.HTTP_ERROR, {
      url,
      request,
      response,
    }),
  RATE_LIMITED: (url: string, request: Object, response: Response) =>
    new StubbornFetchError(StubbornFetchError.types.RATE_LIMITED, {
      url,
      request,
      response,
    }),
};

export default StubbornFetchError;
