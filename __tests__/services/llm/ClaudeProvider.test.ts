import { ClaudeProvider } from '@/src/services/llm/ClaudeProvider';
import { Message, ImageFile, AssistantOption } from '@/src/types/chat';
import { assistantClaude, mockImageFile } from '@/__tests__/test_utils/chat';

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn()
      }
    }))
  };
});

describe('ClaudeProvider', () => {
  let claudeProvider: ClaudeProvider;
  const mockApiKey = 'test-api-key';
  let mockAnthropicCreate: jest.Mock;

  beforeEach(() => {
    claudeProvider = new ClaudeProvider(mockApiKey);
    mockAnthropicCreate = (claudeProvider as any).anthropic.messages
      .create as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getChatCompletion', () => {
    const mockChatHistory: Message[] = [
      { question: 'Hello', answer: 'Hi there!', assistant: 'default-gpt-4' }
    ];
    const mockUserMessage = 'How are you?';
    const mockFetchedText = 'Some fetched text';
    const mockAssistantOption = assistantClaude;

    it('should call Anthropic API and return the response', async () => {
      const mockResponse = {
        content: [{ text: 'I am doing well, thank you for asking!' }]
      };
      mockAnthropicCreate.mockResolvedValue(mockResponse);

      const result = await claudeProvider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockAssistantOption
      );

      expect(result).toBe('I am doing well, thank you for asking!');
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: mockAssistantOption.config.model.value,
          temperature: mockAssistantOption.config.temperature,
          max_tokens: 4096,
          top_p: mockAssistantOption.config.topP,
          system: expect.any(String),
          messages: [
            {
              role: 'user',
              content: expect.stringContaining(mockUserMessage)
            }
          ]
        })
      );
    });

    it('should handle image input correctly', async () => {
      const mockBase64Image = mockImageFile;
      const mockResponse = {
        content: [{ text: 'I see an image in your message.' }]
      };
      mockAnthropicCreate.mockResolvedValue(mockResponse);

      const result = await claudeProvider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockAssistantOption,
        [mockBase64Image]
      );

      expect(result).toBe('I see an image in your message.');
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'user',
              content: expect.arrayContaining([
                { type: 'text', text: expect.any(String) },
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: 'base64encodedimage'
                  }
                }
              ])
            }
          ])
        })
      );
    });

    it('should handle errors and retry', async () => {
      mockAnthropicCreate
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({ content: [{ text: 'Retry successful' }] });

      const result = await claudeProvider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockAssistantOption
      );

      expect(result).toBe('Retry successful');
      expect(mockAnthropicCreate).toHaveBeenCalledTimes(2);
    });

    it('should throw an error after max retries', async () => {
      mockAnthropicCreate.mockRejectedValue(new Error('API Error'));

      await expect(
        claudeProvider.getChatCompletion(
          mockChatHistory,
          mockUserMessage,
          mockFetchedText,
          mockAssistantOption
        )
      ).rejects.toThrow('API Error');
    });
  });
});
