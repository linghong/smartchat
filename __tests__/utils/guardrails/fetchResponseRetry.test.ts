import {
  MAX_ATTEMPTS,
  BASE_RETRY_DELAY,
  delay,
  handleRetry
} from '@/src/utils/guardrails/fetchResponseRetry';

jest.useFakeTimers();

describe('fetchResponseRetry', () => {
  describe('delay', () => {
    it('should resolve after the specified time', async () => {
      const promise = delay(1000);
      jest.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('handleRetry', () => {
    it('should throw an error if retry count exceeds MAX_ATTEMPTS', async () => {
      const error = new Error('Test error');
      await expect(handleRetry(error, MAX_ATTEMPTS + 1)).rejects.toThrow(
        'Test error'
      );
    });

    it('should delay with exponential backoff', async () => {
      const error = new Error('Test error');
      const spyDelay = jest.spyOn(global, 'setTimeout');

      // Test for retry count 1
      const promise1 = handleRetry(error, 1);
      jest.advanceTimersByTime(BASE_RETRY_DELAY * 2);
      await promise1;
      expect(spyDelay).toHaveBeenCalledWith(
        expect.any(Function),
        BASE_RETRY_DELAY * 2
      );

      // Test for retry count 2
      const promise2 = handleRetry(error, 2);
      jest.advanceTimersByTime(BASE_RETRY_DELAY * 4);
      await promise2;
      expect(spyDelay).toHaveBeenCalledWith(
        expect.any(Function),
        BASE_RETRY_DELAY * 4
      );

      // Test for retry count 3
      const promise3 = handleRetry(error, 3);
      jest.advanceTimersByTime(BASE_RETRY_DELAY * 8);
      await promise3;
      expect(spyDelay).toHaveBeenCalledWith(
        expect.any(Function),
        BASE_RETRY_DELAY * 8
      );

      spyDelay.mockRestore();
    });
  });

  describe('constants', () => {
    it('should have correct values', () => {
      expect(MAX_ATTEMPTS).toBe(4);
      expect(BASE_RETRY_DELAY).toBe(1000);
    });
  });
});
