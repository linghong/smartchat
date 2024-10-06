export const MAX_ATTEMPTS = 4;
export const BASE_RETRY_DELAY = 1000; // 1 second

export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export interface ErrorHandlerOptions {
  maxRetries?: number;
  baseRetryDelay?: number;
}

export const handleRetry = async (
  error: any,
  retryCount: number
): Promise<void> => {
  if (retryCount > MAX_ATTEMPTS) {
    throw error;
  }

  const retryDelay = BASE_RETRY_DELAY * Math.pow(2, retryCount);
  await delay(retryDelay);
};
