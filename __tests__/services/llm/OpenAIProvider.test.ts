/**
 * @jest-environment node
 */
import 'openai/shims/node';
import { OpenAIProvider } from '@/src/services/llm/OpenAIProvider';
import { OpenAI } from 'openai';
import { encode } from 'gpt-tokenizer';
import { Message, AssistantOption, ImageFile } from '@/src/types/chat';
import { assistantOpenAI } from '@/__tests__/test_utils/chat';

jest.mock('gpt-tokenizer');

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  let mockOpenAI: jest.Mocked<OpenAI>;
  let consoleErrorSpy: jest.SpyInstance;
  let mockCreateCompletion: jest.Mock;

  const mockApiKey = 'test-api-key';
  const mockChatHistory: Message[] = [
    { question: 'user', answer: 'Hello', assistant: 'default-gpt-4' },
    { question: 'assistant', answer: 'Hi there!', assistant: 'default-gpt-4' }
  ];
  const mockUserMessage = 'How are you?';
  const mockFetchedText = 'Some fetched text';
  const mockAssistantOption: AssistantOption = assistantOpenAI;

  beforeEach(() => {
    // Spy on console.error to suppress logs during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    jest.clearAllMocks();
    mockOpenAI = new OpenAI({ apiKey: mockApiKey }) as jest.Mocked<OpenAI>;

    mockCreateCompletion = jest.fn();
    mockOpenAI.chat.completions.create = mockCreateCompletion;

    // Mock 'encode' function
    (encode as jest.MockedFunction<typeof encode>).mockReturnValue(
      new Array(10)
    );

    provider = new OpenAIProvider(mockApiKey);

    (provider as any).openai = mockOpenAI;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('getChatCompletion', () => {
    it('should call OpenAI API with correct parameters', async () => {
      const mockCompletion = {
        choices: [
          { message: { content: 'AI response' }, finish_reason: 'stop' }
        ],
        usage: { total_tokens: 100 }
      };
      (mockCreateCompletion as jest.Mock).mockResolvedValue(
        mockCompletion as any
      );

      await provider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockAssistantOption
      );

      expect(mockCreateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 1,
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.any(String)
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.anything()
            }),
            expect.objectContaining({
              role: 'assistant',
              content: expect.anything()
            })
          ])
        })
      );
    });

    it('should handle image input correctly', async () => {
      const mockImageFile: ImageFile = {
        base64Image: 'base64image',
        mimeType: 'image/jpeg',
        size: 1000,
        name: 'test.jpg'
      };
      const mockCompletion = {
        choices: [
          {
            message: { content: 'AI response with image' },
            finish_reason: 'stop'
          }
        ],
        usage: { total_tokens: 100 }
      };
      (mockCreateCompletion as jest.Mock).mockResolvedValue(
        mockCompletion as any
      );

      await provider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockAssistantOption,
        [mockImageFile]
      );

      expect(mockCreateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.arrayContaining([
                { type: 'text', text: expect.any(String) },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${mockImageFile.base64Image}`,
                    detail: 'low'
                  }
                }
              ])
            })
          ])
        })
      );
    });

    it('should handle API errors and retry', async () => {
      (mockCreateCompletion as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          choices: [
            { message: { content: 'Retry success' }, finish_reason: 'stop' }
          ],
          usage: { total_tokens: 100 }
        } as any);

      const result = await provider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockAssistantOption
      );

      expect(mockCreateCompletion).toHaveBeenCalledTimes(2);
      expect(result).toBe('Retry success');
    });

    it('should throw an error after maximum retries', async () => {
      (mockCreateCompletion as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        provider.getChatCompletion(
          mockChatHistory,
          mockUserMessage,
          mockFetchedText,
          mockAssistantOption
        )
      ).rejects.toThrow('API Error');

      expect(mockCreateCompletion).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should handle errors and retry', async () => {
      mockCreateCompletion
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          choices: [{
            message: { content: 'Retry successful' },
            finish_reason: 'stop'
          }],
          usage: { total_tokens: 100 }
        } as any);

      const result = await provider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockAssistantOption
      );

      expect(result).toBe('Retry successful');
      expect(mockCreateCompletion).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw an error after max retries', async () => {
      mockCreateCompletion.mockRejectedValue(new Error('API Error'));

      await expect(
        provider.getChatCompletion(
          mockChatHistory,
          mockUserMessage,
          mockFetchedText,
          mockAssistantOption
        )
      ).rejects.toThrow('API Error');

      expect(mockCreateCompletion).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle non-200 responses', async () => {
      mockCreateCompletion.mockRejectedValue({
        response: { status: 400, data: { error: 'Bad Request' } }
      });

      await expect(
        provider.getChatCompletion(
          mockChatHistory,
          mockUserMessage,
          mockFetchedText,
          mockAssistantOption
        )
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });
  });
});
