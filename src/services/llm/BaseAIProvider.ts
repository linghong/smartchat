import { Message, ImageFile, AssistantOption } from '@/src/types/chat';
import { handleRetry, MAX_ATTEMPTS } from '@/src/utils/fetchResponseRetry';

export interface AIProvider {
  getChatCompletion(
    chatHistory: Message[],
    userMessage: string,
    fetchedText: string,
    selectedAssistant: AssistantOption,
    base64ImageSrc?: ImageFile[]
  ): Promise<string | undefined>;
}

export abstract class BaseAIProvider implements AIProvider {
  protected constructor(protected apiKey: string) {}

  abstract getChatCompletion(
    chatHistory: Message[],
    userMessage: string,
    fetchedText: string,
    selectedAssistant: AssistantOption,
    base64ImageSrc?: ImageFile[]
  ): Promise<string | undefined>;

  protected formatUserMessage(
    userMessage: string,
    fetchedText: string,
    basePrompt: string
  ): string {
    return fetchedText
      ? `${userMessage}\n '''fetchedStart ${fetchedText} fetchedEnd'''\n${basePrompt}`
      : `${userMessage}\n${basePrompt}`;
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    errorMessage: string,
    maxAttempts: number = MAX_ATTEMPTS
  ): Promise<T> {
    for (let attempt = 1; attempt < maxAttempts + 1; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        if (attempt === maxAttempts) {
          // If this is the last retry, throw the error
          throw error;
        }
        await handleRetry(error, attempt - 1);
      }
    }
    // This line should never be reached, but TypeScript requires it
    throw new Error(`${errorMessage} after ${maxAttempts} attempts.`);
  }

  protected handleError(error: any): never {
    console.error(error?.response?.data || error);
    throw new Error(error.message || 'Something went wrong');
  }
}
