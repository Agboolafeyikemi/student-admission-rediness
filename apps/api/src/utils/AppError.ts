export class AppError extends Error {
  readonly statusCode: number;
  // Distinguishes expected operational errors from programmer bugs.
  // Only operational errors get their message forwarded to the client.
  readonly isOperational = true;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400);
  }

  static notFound(resource: string): AppError {
    return new AppError(`${resource} not found`, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  static unprocessable(message: string): AppError {
    return new AppError(message, 422);
  }
}
