const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";
const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function withTimeout(signal, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    },
  };
}

export function buildUrl(path, params = {}) {
  const url = new URL(path, API_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

export async function apiRequest(path, { params, signal, timeoutMs = DEFAULT_TIMEOUT_MS, retries = 0 } = {}) {
  const url = buildUrl(path, params);
  let attempt = 0;

  while (true) {
    const timeout = withTimeout(signal, timeoutMs);
    try {
      const response = await fetch(url, { signal: timeout.signal });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ApiError(body?.detail || `Request failed with status ${response.status}`, {
          status: response.status,
          body,
        });
      }

      return body;
    } catch (error) {
      if (error.name === "AbortError" || attempt >= retries) {
        throw error;
      }
      attempt += 1;
    } finally {
      timeout.cleanup();
    }
  }
}
