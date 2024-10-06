import { GeminiProvider } from '@/src/services/llm/GeminiProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, AssistantOption } from '@/src/types/chat';
import * as fetchResponseRetry from '@/src/utils/guardrails/fetchResponseRetry';
import { assistantGemini, mockImageFile } from '@/__tests__/test_utils/chat';

jest.mock('@google/generative-ai');

describe('GeminiProvider', () => {
  const apiKey = 'test-api-key';
  let provider: GeminiProvider;
  let mockGenerativeModel: any;
  let mockChat: any;

  beforeEach(() => {
    mockChat = {
      sendMessage: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('Mock response')
        }
      })
    };
    mockGenerativeModel = {
      startChat: jest.fn().mockReturnValue(mockChat)
    };
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockGenerativeModel)
    }));
    // Use jest.spyOn to mock handleRetry
    jest
      .spyOn(fetchResponseRetry, 'handleRetry')
      .mockImplementation(() => Promise.resolve());

    // Create provider with 3 retries
    provider = new GeminiProvider(apiKey);
  });

  const mockChatHistory: Message[] = [
    { question: 'Hello', answer: 'Hi there!', assistant: 'default-gept-4' }
  ];
  const mockUserMessage = 'How are you?';
  const mockFetchedText = 'Some fetched text';
  const mockSelectedAssistant: AssistantOption = assistantGemini;

  afterEach(() => {
    jest.restoreAllMocks(); // Restores all spies created with jest.spyOn
    jest.clearAllMocks(); // Clears the call history of all mocks
  });

  it('should initialize with the provided API key', () => {
    expect(GoogleGenerativeAI).toHaveBeenCalledWith(apiKey);
  });

  it('should get chat completion successfully', async () => {
    const result = await provider.getChatCompletion(
      mockChatHistory,
      mockUserMessage,
      mockFetchedText,
      mockSelectedAssistant
    );

    expect(result).toBe('Mock response');
    expect(mockGenerativeModel.startChat).toHaveBeenCalled();
    expect(mockChat.sendMessage).toHaveBeenCalled();
  });

  it('should handle image input correctly', async () => {
    await provider.getChatCompletion(
      mockChatHistory,
      mockUserMessage,
      mockFetchedText,
      mockSelectedAssistant,
      [mockImageFile]
    );

    expect(mockChat.sendMessage).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.any(String),
        expect.objectContaining({
          inlineData: {
            data: mockImageFile.base64Image,
            mimeType: mockImageFile.mimeType
          }
        })
      ])
    );
  });

  it('should handle errors and retry 3 times', async () => {
    const mockError = new Error('API Error');
    mockChat.sendMessage
      .mockRejectedValueOnce(mockError)
      .mockRejectedValueOnce(mockError)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({
        response: {
          text: jest.fn().mockReturnValue('Success after retry')
        }
      });

    const result = await provider.getChatCompletion(
      mockChatHistory,
      mockUserMessage,
      mockFetchedText,
      mockSelectedAssistant
    );

    expect(result).toBe('Success after retry');
    expect(mockChat.sendMessage).toHaveBeenCalledTimes(4);
    expect(fetchResponseRetry.handleRetry).toHaveBeenCalledTimes(3);
  });

  it('should throw an error after 3 retries', async () => {
    const mockError = new Error('API Error');
    mockChat.sendMessage.mockRejectedValue(mockError);

    await expect(
      provider.getChatCompletion(
        mockChatHistory,
        mockUserMessage,
        mockFetchedText,
        mockSelectedAssistant
      )
    ).rejects.toThrow('API Error');

    expect(mockChat.sendMessage).toHaveBeenCalledTimes(4);
    expect(fetchResponseRetry.handleRetry).toHaveBeenCalledTimes(3);
  });
});
