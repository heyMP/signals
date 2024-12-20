type FetchWrapperErrorType = 'STATUS_ERROR' | 'PARSE_ERROR' | 'NETWORK_ERROR';

type FetchWrapperErrorParams = Pick<
  // eslint-disable-next-line no-use-before-define
  FetchWrapperError,
  'ok' | 'type' | 'status' | 'statusText' | 'response' | 'error' | 'headers'
>;

export class FetchWrapperError extends Error {
  ok: boolean;

  type: FetchWrapperErrorType;

  status: number;

  statusText: string;

  response: Response | null;

  headers: Record<PropertyKey, string> | null;

  error: Error;

  constructor(args: FetchWrapperErrorParams) {
    super();
    this.ok = args.ok;
    this.type = args.type;
    this.status = args.status;
    this.statusText = args.statusText;
    this.response = args.response;
    this.headers = args.headers;
    this.error = args.error;
    this.message = args.type;

    // add the status error to the message
    if (this.type === 'STATUS_ERROR') {
      this.message += `: ${this.status}`;
    }
  }
}

type FetchWrapperParams = {
  url: string;
  options?: RequestInit;
  parser?: 'json' | 'text';
  maxRetryCount?: number;
};

type FetchWrapperResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: FetchWrapperError;
    };

const fetchWithRetries = async (
  url: string,
  options: RequestInit,
  maxRetryCount: number,
  retryCount = 0
): Promise<Response> => {
  try {
    return await fetch(url, options ?? {});
  } catch (e) {
    if (retryCount < maxRetryCount) {
      return fetchWithRetries(url, options, maxRetryCount, retryCount + 1);
    }
    throw e;
  }
};

const fetchOriginalResponse = (
  url: string,
  options?: RequestInit,
  maxRetryCount?: number
): Promise<Response> => {
  if (maxRetryCount) {
    return fetchWithRetries(url, options ?? {}, maxRetryCount);
  }

  return fetch(url, options ?? {});
};

/**
 * Returns the results of fetch as values
 * instead of throwing errors.
 *
 * @example
 * const {data, error} = await fetchWrapper<TODO[]>(fetch('https://jsonplaceholder.typicode.com/todos'));
 * if (error) {
 *   if (error.status === '403') {
 *    console.log('You need to log in')
 *   } else {
 *    const {err} = error;
 *    err.name = 'Service Error: failed to fetch todos'
 *    err.message = error.type;
 *    throw err;
 *   }
 * }
 * const todos = data;
 */
export async function fetchWrapper<T = any>(
  args: FetchWrapperParams
): Promise<FetchWrapperResult<T>> {
  const { url, options, parser, maxRetryCount } = args;
  let response: Response;
  try {
    const originalResponse = await fetchOriginalResponse(
      url,
      options,
      maxRetryCount
    );
    response = originalResponse.clone();

    if (!response.ok) {
      return {
        data: null,
        error: new FetchWrapperError({
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          response,
          headers: Object.fromEntries(response.headers.entries()),
          type: 'STATUS_ERROR',
          error: new Error('STATUS_NOT_OK'),
        }),
      };
    }

    // Parse
    try {
      const data = (await originalResponse[parser ?? 'json']()) as T;
      return {
        data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: new FetchWrapperError({
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          type: 'PARSE_ERROR',
          headers: Object.fromEntries(response.headers.entries()),
          response,
          error: error as Error,
        }),
      };
    }
  } catch (error) {
    return {
      data: null,
      error: new FetchWrapperError({
        ok: false,
        status: 0,
        statusText: 'Network Error',
        response: null,
        type: 'NETWORK_ERROR',
        headers: null,
        error: error as Error,
      }),
    };
  }
}

export async function fetchWrapperTimer<T = any>(
  args: FetchWrapperParams,
  timer: number
): Promise<FetchWrapperResult<T>> {
  // eslint-disable-next-line no-promise-executor-return
  const delay = new Promise<void>(res => setTimeout(res, timer));
  const [result] = await Promise.all([fetchWrapper<T>(args), delay]);
  return result;
}
