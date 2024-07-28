const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const handleErrors = async (error: any, retryCount: number) => {
  if (retryCount >= MAX_RETRIES) {
    throw error;
  }

  await delay(RETRY_DELAY * (retryCount + 1));
};
