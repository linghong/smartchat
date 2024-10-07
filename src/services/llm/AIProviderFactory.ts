import { AIProvider } from '@/src/services/llm/BaseAIProvider';
import { OpenAIProvider } from '@/src/services/llm/OpenAIProvider';
import { ClaudeProvider } from '@/src/services/llm/ClaudeProvider';
import { GeminiProvider } from '@/src/services/llm/GeminiProvider';
import { GroqProvider } from '@/src/services/llm/GroqProvider';
import { CloudHostedAIProvider } from '@/src/services/llm/CloudHostedAIProvider';
import { AppError, UserInputError } from './CustomErrorTypes';

export class AIProviderFactory {
  static createProvider(
    providerType: string,
    apiKey: string,
    baseUrl?: string
  ): AIProvider {
    try {
      switch (providerType) {
        case 'openai':
          return new OpenAIProvider(apiKey);
        case 'anthropic':
          return new ClaudeProvider(apiKey);
        case 'google':
          return new GeminiProvider(apiKey);
        case 'groq':
          return new GroqProvider(apiKey);
        case 'hf-small':
        case 'hf-large':
          if (!baseUrl) {
            throw new UserInputError(
              'Base URL is required for self-hosted models'
            );
          }
          return new CloudHostedAIProvider(apiKey, baseUrl);
        default:
          throw new UserInputError(
            `Unsupported AI provider type: ${providerType}`
          );
      }
    } catch (error) {
      if (error instanceof UserInputError) {
        throw error;
      } else if (error instanceof Error) {
        throw new AppError(`Error creating AI provider: ${error.message}`);
      } else {
        throw new AppError('Unknown error occurred while creating AI provider');
      }
    }
  }
}
