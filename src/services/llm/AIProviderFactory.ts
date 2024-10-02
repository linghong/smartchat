import { AIProvider } from '@/src/services/llm/BaseAIProvider';
import { OpenAIProvider } from '@/src/services/llm/OpenAIProvider';
import { ClaudeProvider } from '@/src/services/llm/ClaudeProvider';
import { GeminiProvider } from '@/src/services/llm/GeminiProvider';
import { GroqProvider } from '@/src/services/llm/GroqProvider';
import { CloudHostedAIProvider } from '@/src/services/llm/CloudHostedAIProvider';

export class AIProviderFactory {
  static createProvider(
    providerType: string,
    apiKey: string,
    baseUrl?: string
  ): AIProvider {
    switch (providerType) {
      case 'openai':
        return new OpenAIProvider(apiKey);
      case 'anthropic':
        return new ClaudeProvider(apiKey);
      case 'google':
        return new GeminiProvider(apiKey);
      case 'groq':
        return new GroqProvider(apiKey);
      case 'self-hosted-small':
      case 'self-hosted-large':
        if (!baseUrl) {
          throw new Error(`Base URL is required for self-hosted models`);
        }
        return new CloudHostedAIProvider(apiKey, baseUrl);
      default:
        throw new Error(`Unsupported AI provider type: ${providerType}`);
    }
  }
}
