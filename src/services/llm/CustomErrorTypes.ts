/**
 * Custom error class for AI provider-related errors.
 * This should be used when errors occur due to issues with the AI service,
 * such as API failures, rate limiting, or invalid responses.
 */
export class AIProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIProviderError';
  }
}

/**
 * Custom error class for application-specific errors.
 * This should be used for errors that occur within the application logic,
 * such as data processing errors, invalid state, or internal server errors.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Custom error class for network-related errors.
 * This can be used for timeouts, connection failures, or other network issues.
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Custom error class for user input errors.
 * This can be used when the error is caused by invalid or inappropriate user input.
 */
export class UserInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserInputError';
  }
}
