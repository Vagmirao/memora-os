import { API_CONFIG } from './apiConfig';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeoutMs = API_CONFIG.timeoutMs,
    ...fetchOptions
  } = options;

  const controller = new AbortController();

  const timeout = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${endpoint}`,
      {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      }
    );

    const contentType =
      response.headers.get('content-type') ?? '';

    const isJson =
      contentType.includes('application/json');

    const data = isJson
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        'The request timed out.',
        408
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export const httpClient = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, {
      method: 'GET',
    });
  },

  post<T>(
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: body === undefined
        ? undefined
        : JSON.stringify(body),
    });
  },

  put<T>(
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: body === undefined
        ? undefined
        : JSON.stringify(body),
    });
  },

  patch<T>(
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body === undefined
        ? undefined
        : JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, {
      method: 'DELETE',
    });
  },
};