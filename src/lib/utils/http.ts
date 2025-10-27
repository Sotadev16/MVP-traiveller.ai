// HTTP utilities with retry logic

import { ProviderError, RateLimitError } from './errors';

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = 8000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * Math.pow(2, attempt);

        if (attempt < retries - 1) {
          await sleep(delay);
          continue;
        }

        throw new RateLimitError('Rate limit exceeded');
      }

      // Retry on 5xx errors
      if (response.status >= 500 && attempt < retries - 1) {
        await sleep(retryDelay * Math.pow(2, attempt));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on abort/timeout if it's the last attempt
      if (attempt === retries - 1) {
        break;
      }

      // Wait before retry with exponential backoff
      await sleep(retryDelay * Math.pow(2, attempt));
    }
  }

  throw new ProviderError(
    `Failed after ${retries} attempts: ${lastError?.message || 'Unknown error'}`,
    { originalError: lastError }
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate request ID for tracking
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Build query string from params
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}
