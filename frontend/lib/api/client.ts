import { clientEnv } from "@/lib/env/client-env";

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = "UNKNOWN_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

let tokenProvider: (() => string | null) | null = null;

export const setApiTokenProvider = (provider: (() => string | null) | null): void => {
  tokenProvider = provider;
};

const getAuthToken = (): string | null => {
  if (tokenProvider) {
    return tokenProvider();
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("ssot.accessToken");
};

const request = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${clientEnv.apiBaseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let parsed: unknown = null;
  try {
    parsed = await response.json();
  } catch {
    throw new ApiClientError("Invalid JSON response", response.status, "INVALID_JSON");
  }

  if (!response.ok) {
    const envelope = parsed as Partial<ApiErrorEnvelope>;
    const message = envelope.error?.message ?? `HTTP ${response.status}`;
    const code = envelope.error?.code ?? "HTTP_ERROR";
    throw new ApiClientError(message, response.status, code);
  }

  const successEnvelope = parsed as Partial<ApiSuccessEnvelope<T>>;

  if (!successEnvelope.success) {
    throw new ApiClientError("Unexpected API response envelope", response.status, "INVALID_ENVELOPE");
  }

  return successEnvelope.data as T;
};

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>("GET", path),
  post: <T>(path: string, body?: unknown): Promise<T> => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown): Promise<T> => request<T>("PATCH", path, body),
  put: <T>(path: string, body?: unknown): Promise<T> => request<T>("PUT", path, body),
  delete: <T>(path: string): Promise<T> => request<T>("DELETE", path)
};