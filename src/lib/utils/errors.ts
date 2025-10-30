// Error handling utilities

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, details, 400);
    this.name = 'ValidationError';
  }
}

export class ProviderError extends AppError {
  constructor(message: string, details?: unknown) {
    super('PROVIDER_ERROR', message, details, 502);
    this.name = 'ProviderError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super('NOT_FOUND', message, undefined, 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super('RATE_LIMIT', message, undefined, 429);
    this.name = 'RateLimitError';
  }
}

export function mapProviderError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new ProviderError(error.message, { originalError: error.name });
  }

  return new ProviderError('Unknown provider error', { error });
}

export function getErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      statusCode: error.statusCode,
    };
  }

  // Unknown error - return generic 500
  return {
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    },
    statusCode: 500,
  };
}
