import { AIProviderFactory } from '@/src/services/llm/AIProviderFactory';
import { OpenAIProvider } from '@/src/services/llm/OpenAIProvider';
import { ClaudeProvider } from '@/src/services/llm/ClaudeProvider';
import { GeminiProvider } from '@/src/services/llm/GeminiProvider';
import { GroqProvider } from '@/src/services/llm/GroqProvider';
import { CloudHostedAIProvider } from '@/src/services/llm/CloudHostedAIProvider';
import { UserInputError, AppError } from '@/src/services/llm/CustomErrorTypes';

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

  it('creates an OpenAIProvider', () => {
    const provider = AIProviderFactory.createProvider('openai', apiKey);
    expect(provider).toBeInstanceOf(OpenAIProvider);
    expect(OpenAIProvider).toHaveBeenCalledWith(apiKey);
  });

  it('creates a ClaudeProvider', () => {
    const provider = AIProviderFactory.createProvider('anthropic', apiKey);
    expect(provider).toBeInstanceOf(ClaudeProvider);
    expect(ClaudeProvider).toHaveBeenCalledWith(apiKey);
  });

  it('creates a GeminiProvider', () => {
    const provider = AIProviderFactory.createProvider('google', apiKey);
    expect(provider).toBeInstanceOf(GeminiProvider);
    expect(GeminiProvider).toHaveBeenCalledWith(apiKey);
  });

  it('creates a GroqProvider', () => {
    const provider = AIProviderFactory.createProvider('groq', apiKey);
    expect(provider).toBeInstanceOf(GroqProvider);
    expect(GroqProvider).toHaveBeenCalledWith(apiKey);
  });

  it('creates a CloudHostedAIProvider for self-hosted-small', () => {
    const provider = AIProviderFactory.createProvider(
      'hf-small',
      apiKey,
      baseUrl
    );
    expect(provider).toBeInstanceOf(CloudHostedAIProvider);
    expect(CloudHostedAIProvider).toHaveBeenCalledWith(apiKey, baseUrl);
  });

  it('creates a CloudHostedAIProvider for self-hosted-large', () => {
    const provider = AIProviderFactory.createProvider(
      'hf-large',
      apiKey,
      baseUrl
    );
    expect(provider).toBeInstanceOf(CloudHostedAIProvider);
    expect(CloudHostedAIProvider).toHaveBeenCalledWith(apiKey, baseUrl);
  });

  it('throws a UserInputError for unsupported provider type', () => {
    expect(() =>
      AIProviderFactory.createProvider('unsupported', apiKey)
    ).toThrow(UserInputError);
    expect(() =>
      AIProviderFactory.createProvider('unsupported', apiKey)
    ).toThrow('Unsupported AI provider type: unsupported');
  });

  it('throws a UserInputError for self-hosted models without base URL', () => {
    expect(() => AIProviderFactory.createProvider('hf-small', apiKey)).toThrow(
      UserInputError
    );
    expect(() => AIProviderFactory.createProvider('hf-small', apiKey)).toThrow(
      'Base URL is required for self-hosted models'
    );
  });

  it('throws an AppError for other errors during provider creation', () => {
    const mockError = new Error('Unexpected error');
    (
      OpenAIProvider as jest.MockedClass<typeof OpenAIProvider>
    ).mockImplementationOnce(() => {
      throw mockError;
    });

    expect(() => {
      AIProviderFactory.createProvider('openai', apiKey);
    }).toThrow(AppError);

    try {
      AIProviderFactory.createProvider('openai', apiKey);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).message).toMatch(/Error creating AI provider/);
      expect((error as AppError).message).toContain(mockError.message);
    }
  });
});
