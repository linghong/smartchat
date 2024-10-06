import { CloudHostedAIProvider } from '@/src/services/llm/CloudHostedAIProvider';
import { Message, AssistantOption } from '@/src/types/chat';
import { assistantHFsm, assistantHFlg } from '@/__tests__/test_utils/chat';
import * as fetchResponseRetry from '@/src/utils/guardrails/fetchResponseRetry';

// Mock fetch globally
global.fetch = jest.fn();

describe('CloudHostedAIProvider', () => {
  const apiKey = 'test-api-key';
  const baseUrl = 'http://test-base-url.com';
  let provider: CloudHostedAIProvider;

  beforeEach(() => {
    provider = new CloudHostedAIProvider(apiKey, baseUrl);
    (global.fetch as jest.Mock).mockClear();

    // Mock handleRetry to avoid delays during testing
    jest
      .spyOn(fetchResponseRetry, 'handleRetry')
      .mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  const mockChatHistory: Message[] = [
    { question: 'Hello', answer: 'Hi there!', assistant: 'GPT4-writing' }
  ];
  const mockUserMessage = 'How are you?';
  const mockFetchedText = 'Some fetched text';
  const mockSelectedAssistant: AssistantOption = assistantHFlg;

  it('should initialize with the provided API key and base URL', () => {
    expect(provider['apiKey']).toBe(apiKey);
    expect(provider['baseUrl']).toBe(baseUrl);
  });

  it('should get chat completion successfully for self-hosted-small model', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Mock response' })
    });

    const smallModelAssistant: AssistantOption = assistantHFsm;

    const result = await provider.getChatCompletion(
      mockChatHistory,
      mockUserMessage,
      mockFetchedText,
      smallModelAssistant
    );

    expect(result).toBe('Mock response');
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/chat_cpu`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          question: mockUserMessage,
          basePrompt: smallModelAssistant.config.basePrompt,
          chatHistory: mockChatHistory,
          selectedModel: smallModelAssistant.config.model.value,
          fetchedText: mockFetchedText,
          temperature: smallModelAssistant.config.temperature,
          topP: smallModelAssistant.config.topP
        })
      })
    );
  });

  it('should get chat completion successfully for self-hosted-large model', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Mock response' })
    });

    const largeModelAssistant: AssistantOption = {
      ...mockSelectedAssistant,
      config: {
        ...mockSelectedAssistant.config,
        model: {
          value: 'gpt-3.5-turbo',
          label: 'GPT 3.5 Turbo',
          category: 'self-hosted-large'
        }
      }
    };

    const result = await provider.getChatCompletion(
      mockChatHistory,
      mockUserMessage,
      mockFetchedText,
      largeModelAssistant
    );

    expect(result).toBe('Mock response');
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/chat_gpu`,
      expect.any(Object)
    );
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(
      provider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockSelectedAssistant
      )
    ).rejects.toThrow('Network error');
  }, 30000);

  it('should handle non-OK responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error'
    });

    await expect(
      provider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockSelectedAssistant
      )
    ).rejects.toThrow('Network response was not ok: Internal Server Error');
  }, 30000);

  it('should return undefined if API key is not provided', async () => {
    const providerWithoutKey = new CloudHostedAIProvider('', baseUrl);
    const result = await providerWithoutKey.getChatCompletion(
      mockChatHistory,
      mockUserMessage,
      mockFetchedText,
      mockSelectedAssistant
    );

    expect(result).toBeUndefined();
  });

  it('should retry on fetch failure and succeed on retry', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Temporary Network Error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Retry response' })
      });

    const result = await provider.getChatCompletion(
      mockChatHistory,
      mockUserMessage,
      mockFetchedText,
      mockSelectedAssistant
    );

    expect(result).toBe('Retry response');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(fetchResponseRetry.handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should throw an error after maximum retries are exceeded', async () => {
    const networkError = new Error('Persistent Network Error');
    (global.fetch as jest.Mock).mockRejectedValue(networkError);

    await expect(
      provider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockSelectedAssistant
      )
    ).rejects.toThrow(networkError);

    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect(fetchResponseRetry.handleRetry).toHaveBeenCalledTimes(3);
  });
});
