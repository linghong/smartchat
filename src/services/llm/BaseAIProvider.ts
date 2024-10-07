import { Message, ImageFile, AssistantOption } from '@/src/types/chat';
import {
  handleRetry,
  MAX_ATTEMPTS
} from '@/src/utils/guardrails/fetchResponseRetry';
import {
  AppError,
  AIProviderError,
  NetworkError
} from '@/src/services/llm/CustomErrorTypes';

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

  protected handleError(error: any, providerName: string): never {
    console.error(`Error in ${providerName}:`, error);

    if (error instanceof AIProviderError || error instanceof NetworkError) {
      throw error;
    } else if (error instanceof Error) {
      if (error.message.includes('API') || error.message.includes('auth')) {
        throw new AIProviderError(
          `${providerName} API Error: ${error.message}`
        );
      } else if (
        error.message.includes('network') ||
        error.message.includes('timeout')
      ) {
        throw new NetworkError(
          `Network error with ${providerName} API: ${error.message}`
        );
      } else {
        throw new AppError(
          `App Error in ${providerName} Provider: ${error.message}`
        );
      }
    } else {
      throw new AppError(`Unknown error in ${providerName} Provider`);
    }
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
}
