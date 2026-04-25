import type { ApiErrorPayload } from "../types/api";

const API_PREFIX = "/api";
const API_DEBUG = import.meta.env.DEV;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
const DEFAULT_API_ERROR_MESSAGE = "Falha ao processar requisição";

function normalizePath(path: string): string {
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  }

  if (path.startsWith(API_PREFIX)) {
    return path;
  }

  return `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}

function parseApiErrorMessage(payload: ApiErrorPayload | null): string {
  if (!payload?.message) {
    return DEFAULT_API_ERROR_MESSAGE;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(" | ");
  }

  return payload.message;
}

function hasJsonContentType(response: Response): boolean {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  return contentType.includes("application/json");
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = normalizePath(path);

  const response = await fetch(normalizedPath, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = DEFAULT_API_ERROR_MESSAGE;
    const fallbackResponse = response.clone();

    if (hasJsonContentType(response)) {
      try {
        const payload = (await response.json()) as ApiErrorPayload;
        message = parseApiErrorMessage(payload);
      } catch (error) {
        if (API_DEBUG) {
          console.debug("[apiRequest] failed to parse JSON error payload", {
            normalizedPath,
            status: response.status,
            error,
          });
        }
      }
    }

    if (message === DEFAULT_API_ERROR_MESSAGE) {
      try {
        const rawMessage = (await fallbackResponse.text()).trim();

        if (rawMessage.length > 0) {
          message = rawMessage;
        }
      } catch (error) {
        if (API_DEBUG) {
          console.debug("[apiRequest] failed to parse text error payload", {
            normalizedPath,
            status: response.status,
            error,
          });
        }
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
