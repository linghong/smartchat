import { AIProviderFactory } from '@/src/services/llm/AIProviderFactory';
import { OpenAIProvider } from '@/src/services/llm/OpenAIProvider';
import { ClaudeProvider } from '@/src/services/llm/ClaudeProvider';
import { GeminiProvider } from '@/src/services/llm/GeminiProvider';
import { GroqProvider } from '@/src/services/llm/GroqProvider';
import { CloudHostedAIProvider } from '@/src/services/llm/CloudHostedAIProvider';

jest.mock('@/src/services/llm/OpenAIProvider');
jest.mock('@/src/services/llm/ClaudeProvider');
jest.mock('@/src/services/llm/GeminiProvider');
jest.mock('@/src/services/llm/GroqProvider');
jest.mock('@/src/services/llm/CloudHostedAIProvider');

describe('AIProviderFactory', () => {
  const apiKey = 'test-api-key';
  const baseUrl = 'http://test-base-url.com';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create OpenAIProvider', () => {
    const provider = AIProviderFactory.createProvider('openai', apiKey);
    expect(provider).toBeInstanceOf(OpenAIProvider);
    expect(OpenAIProvider).toHaveBeenCalledWith(apiKey);
  });

  it('should create ClaudeProvider', () => {
    const provider = AIProviderFactory.createProvider('anthropic', apiKey);
    expect(provider).toBeInstanceOf(ClaudeProvider);
    expect(ClaudeProvider).toHaveBeenCalledWith(apiKey);
  });

  it('should create GeminiProvider', () => {
    const provider = AIProviderFactory.createProvider('google', apiKey);
    expect(provider).toBeInstanceOf(GeminiProvider);
    expect(GeminiProvider).toHaveBeenCalledWith(apiKey);
  });

  it('should create GroqProvider', () => {
    const provider = AIProviderFactory.createProvider('groq', apiKey);
    expect(provider).toBeInstanceOf(GroqProvider);
    expect(GroqProvider).toHaveBeenCalledWith(apiKey);
  });

  it('should create CloudHostedAIProvider for self-hosted-small', () => {
    const provider = AIProviderFactory.createProvider(
      'self-hosted-small',
      apiKey,
      baseUrl
    );
    expect(provider).toBeInstanceOf(CloudHostedAIProvider);
    expect(CloudHostedAIProvider).toHaveBeenCalledWith(apiKey, baseUrl);
  });

  it('should create CloudHostedAIProvider for self-hosted-large', () => {
    const provider = AIProviderFactory.createProvider(
      'self-hosted-large',
      apiKey,
      baseUrl
    );
    expect(provider).toBeInstanceOf(CloudHostedAIProvider);
    expect(CloudHostedAIProvider).toHaveBeenCalledWith(apiKey, baseUrl);
  });

  it('should throw an error for unsupported provider type', () => {
    expect(() =>
      AIProviderFactory.createProvider('unsupported', apiKey)
    ).toThrow('Unsupported AI provider type: unsupported');
  });

  it('should throw an error for self-hosted models without baseUrl', () => {
    expect(() =>
      AIProviderFactory.createProvider('self-hosted-small', apiKey)
    ).toThrow('Base URL is required for self-hosted models');
  });
});
