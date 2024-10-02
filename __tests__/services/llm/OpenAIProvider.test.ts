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

  const mockApiKey = 'test-api-key';
  const mockChatHistory: Message[] = [
    { question: 'user', answer: 'Hello', assistant: 'default-gpt-4' },
    { question: 'assistant', answer: 'Hi there!', assistant: 'default-gpt-4' }
  ];
  const mockUserMessage = 'How are you?';
  const mockFetchedText = 'Some fetched text';
  const mockAssistantOption: AssistantOption = assistantOpenAI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenAI = new OpenAI({ apiKey: mockApiKey }) as jest.Mocked<OpenAI>;
    // Mock the 'chat.completions.create' method
    mockOpenAI.chat.completions.create = jest.fn();

    // Mock 'encode' function
    (encode as jest.MockedFunction<typeof encode>).mockReturnValue(
      new Array(10)
    );

    // Instantiate provider
    provider = new OpenAIProvider(mockApiKey);

    // Replace the 'openai' instance with mock
    (provider as any).openai = mockOpenAI;
  });

  describe('getChatCompletion', () => {
    it('should call OpenAI API with correct parameters', async () => {
      const mockCompletion = {
        choices: [
          { message: { content: 'AI response' }, finish_reason: 'stop' }
        ],
        usage: { total_tokens: 100 }
      };
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(
        mockCompletion as any
      );

      await provider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockAssistantOption
      );

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
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
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(
        mockCompletion as any
      );

      await provider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockAssistantOption,
        [mockImageFile]
      );

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
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
      (mockOpenAI.chat.completions.create as jest.Mock)
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

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
      expect(result).toBe('Retry success');
    });

    it('should throw an error after maximum retries', async () => {
      (mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValue(
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

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
    });
  });
});
