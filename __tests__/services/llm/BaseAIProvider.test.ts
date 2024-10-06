// Because BaseAIProvider is an abstract, so we use a mock
import { MockAIProvider } from '@/__tests__/test_utils/MockAIProvider';
import { handleRetry } from '@/src/utils/guardrails/fetchResponseRetry';

jest.mock('@/src/utils/guardrails/fetchResponseRetry', () => ({
  MAX_ATTEMPTS: 3,
  handleRetry: jest.fn().mockResolvedValue(undefined)
}));

describe('BaseAIProvider', () => {
  const apiKey = 'test-api-key';
  let provider: MockAIProvider;

  beforeEach(() => {
    provider = new MockAIProvider(apiKey);
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
      expect(handleRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe('handleError', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log error response data and throw error with message', () => {
      const error = {
        response: {
          data: 'Error response data'
        },
        message: 'An error occurred'
      };

      expect(() => (provider as any).handleError(error)).toThrow(
        'An error occurred'
      );
      expect(consoleSpy).toHaveBeenCalledWith('Error response data');
    });

    it('should log error and throw error with message when response data is undefined', () => {
      const error = new Error('An error occurred');

      expect(() => (provider as any).handleError(error)).toThrow(
        'An error occurred'
      );
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should throw generic error message when error message is undefined', () => {
      const error = {};

      expect(() => (provider as any).handleError(error)).toThrow(
        'Something went wrong'
      );
      expect(consoleSpy).toHaveBeenCalledWith({});
    });
  });
});
