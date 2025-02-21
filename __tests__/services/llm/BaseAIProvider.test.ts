// Because BaseAIProvider is an abstract, so we use a mock
import { MockAIProvider } from '@/__tests__/test_utils/MockAIProvider';
import { handleRetry } from '@/src/utils/guardrails/fetchResponseRetry';
import {
  AppError,
  AIProviderError,
  NetworkError
} from '@/src/services/llm/CustomErrorTypes';

jest.mock('@/src/utils/guardrails/fetchResponseRetry', () => ({
  MAX_ATTEMPTS: 3,
  handleRetry: jest.fn().mockResolvedValue(undefined)
}));

describe('BaseAIProvider', () => {
  const apiKey = 'test-api-key';
  let provider: MockAIProvider;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console.error to suppress logs during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    provider = new MockAIProvider(apiKey);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('formatUserMessage', () => {
    it('should format message with fetchedText and basePrompt', () => {
      const userMessage = 'Hello, how are you?';
      const fetchedText = 'This is some fetched text.';
      const basePrompt = 'This is the base prompt.';

      const result = (provider as any).formatUserMessage(
        userMessage,
        fetchedText,
        basePrompt
      );

      expect(result).toBe(
        "Hello, how are you?\n '''fetchedStart This is some fetched text. fetchedEnd'''\nThis is the base prompt."
      );
    });

    it('should format message without fetchedText', () => {
      const userMessage = 'Hello, how are you?';
      const fetchedText = '';
      const basePrompt = 'This is the base prompt.';

      const result = (provider as any).formatUserMessage(
        userMessage,
        fetchedText,
        basePrompt
      );

      expect(result).toBe('Hello, how are you?\nThis is the base prompt.');
    });
  });

  describe('retryOperation', () => {
    it('should return result if operation succeeds on first try', async () => {
      const operation = jest.fn().mockResolvedValue('Success');
      const errorMessage = 'Operation failed';

      const result = await (provider as any).retryOperation(
        operation,
        errorMessage
      );

      expect(result).toBe('Success');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(handleRetry).not.toHaveBeenCalled();
    });

    it('should retry operation and succeed before reaching max attempts', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce('Success');
      const errorMessage = 'Operation failed';

      const result = await (provider as any).retryOperation(
        operation,
        errorMessage
      );

      expect(result).toBe('Success');
      expect(operation).toHaveBeenCalledTimes(2);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should throw error after reaching max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failure'));
      const errorMessage = 'Operation failed';

      await expect(
        (provider as any).retryOperation(operation, errorMessage)
      ).rejects.toThrow('Failure');

      expect(operation).toHaveBeenCalledTimes(3);
      expect(handleRetry).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleError', () => {
    it('should throw AIProviderError for API-related errors', () => {
      const error = new Error('API authentication failed');

      expect(() =>
        (provider as any).handleError(error, 'TestProvider')
      ).toThrow(AIProviderError);
      expect(() =>
        (provider as any).handleError(error, 'TestProvider')
      ).toThrow('TestProvider API Error: API authentication failed');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('should throw NetworkError for network-related errors', () => {
      const error = new Error('Network timeout');

      expect(() =>
        (provider as any).handleError(error, 'TestProvider')
      ).toThrow(NetworkError);
      expect(() =>
        (provider as any).handleError(error, 'TestProvider')
      ).toThrow('Network error with TestProvider API: Network timeout');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('should throw AppError for other types of errors', () => {
      const error = new Error('Unknown error');

      expect(() =>
        (provider as any).handleError(error, 'TestProvider')
      ).toThrow(AppError);
      expect(() =>
        (provider as any).handleError(error, 'TestProvider')
      ).toThrow('App Error in TestProvider Provider: Unknown error');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('should rethrow AIProviderError and NetworkError', () => {
      const aiProviderError = new AIProviderError('AI provider error');
      expect(() =>
        (provider as any).handleError(aiProviderError, 'TestProvider')
      ).toThrow(AIProviderError);
      expect(() =>
        (provider as any).handleError(aiProviderError, 'TestProvider')
      ).toThrow('AI provider error');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

      const networkError = new NetworkError('Network error');
      expect(() =>
        (provider as any).handleError(networkError, 'TestProvider')
      ).toThrow(NetworkError);
      expect(() =>
        (provider as any).handleError(networkError, 'TestProvider')
      ).toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
    });

    it('should throw AppError for unknown error types', () => {
      const unknownError = { randomProperty: 'value' };

      expect(() =>
        (provider as any).handleError(unknownError, 'TestProvider')
      ).toThrow(AppError);
      expect(() =>
        (provider as any).handleError(unknownError, 'TestProvider')
      ).toThrow('Unknown error in TestProvider Provider');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });
  });
});
