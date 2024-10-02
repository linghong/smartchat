import { GroqProvider } from '@/src/services/llm/GroqProvider';
import { Message } from '@/src/types/chat';
import { Groq } from 'groq-sdk';
import { assistantGroq } from '@/__tests__/test_utils/chat';
import * as fetchResponseRetry from '@/src/utils/fetchResponseRetry';

jest.mock('groq-sdk', () => {
  return {
    Groq: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  };
});

describe('GroqProvider', () => {
  const apiKey = 'fake-api-key';
  let provider: GroqProvider;
  let mockGroq: jest.Mocked<Groq>;

  const mockSelectedAssistant = assistantGroq;

  const chatHistory: Message[] = [
    { question: 'Hello', answer: 'How are you?', assistant: 'llama2-70b-4096' }
  ];
  const userMessage = "What's the weather like?";
  const fetchedText = 'Sunny and 75 degrees';

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new GroqProvider(apiKey);
    mockGroq = (provider as any).groq;

    // Mock handleRetry to avoid delays during testing
    jest
      .spyOn(fetchResponseRetry, 'handleRetry')
      .mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with the provided API key', () => {
      expect(Groq).toHaveBeenCalledWith({ apiKey: apiKey });
    });
  });

  describe('getChatCompletion', () => {
    it('should return a successful response from the Groq API', async () => {
      (mockGroq.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: "It's sunny and 75 degrees{{{Weather Update}}}"
            }
          }
        ]
      });

      const response = await provider.getChatCompletion(
        chatHistory,
        userMessage,
        fetchedText,
        mockSelectedAssistant
      );

      expect(response).toEqual("It's sunny and 75 degrees{{{Weather Update}}}");
      expect(
        mockGroq.chat.completions.create as jest.Mock
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'system', content: expect.any(String) },
            { role: 'user', content: expect.stringContaining(userMessage) }
          ]),
          model: mockSelectedAssistant.config.model.value,
          temperature: mockSelectedAssistant.config.temperature,
          top_p: mockSelectedAssistant.config.topP
        })
      );
    });

    it('should throw an error if no completion choices are returned', async () => {
      (mockGroq.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: []
      });

      await expect(
        provider.getChatCompletion(
          chatHistory,
          userMessage,
          fetchedText,
          mockSelectedAssistant
        )
      ).rejects.toThrow('No completion choices returned from the server.');
    });

    it('should handle API failures correctly', async () => {
      (mockGroq.chat.completions.create as jest.Mock).mockRejectedValue(
        new Error('API failure')
      );

      await expect(
        provider.getChatCompletion(
          chatHistory,
          userMessage,
          fetchedText,
          mockSelectedAssistant
        )
      ).rejects.toThrow('API failure');
    });

    it('should format user message with fetched text correctly', async () => {
      (mockGroq.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: 'Response' } }]
      });

      await provider.getChatCompletion(
        chatHistory,
        userMessage,
        fetchedText,
        mockSelectedAssistant
      );

      const lastMessage = (
        mockGroq.chat.completions.create as jest.Mock
      ).mock.calls[0][0].messages.pop();
      expect(lastMessage?.content).toContain(userMessage);
      expect(lastMessage?.content).toContain(fetchedText);
      expect(lastMessage?.content).toContain(
        mockSelectedAssistant.config.basePrompt
      );
    });

    it('should build chat array correctly', async () => {
      (mockGroq.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: 'Response' } }]
      });

      await provider.getChatCompletion(
        chatHistory,
        userMessage,
        fetchedText,
        mockSelectedAssistant
      );

      const messages = (mockGroq.chat.completions.create as jest.Mock).mock
        .calls[0][0].messages;
      expect(messages).toContainEqual({
        role: 'user',
        content: chatHistory[0].question
      });
      expect(messages).toContainEqual({
        role: 'assistant',
        content: chatHistory[0].answer
      });
    });

    it('should retry on API failure and succeed on retry', async () => {
      (mockGroq.chat.completions.create as jest.Mock)
        .mockRejectedValueOnce(new Error('Temporary API Error'))
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: "It's sunny and 75 degrees{{{Weather Update}}}"
              }
            }
          ]
        });

      const response = await provider.getChatCompletion(
        chatHistory,
        userMessage,
        fetchedText,
        mockSelectedAssistant
      );

      expect(response).toEqual("It's sunny and 75 degrees{{{Weather Update}}}");
      expect(mockGroq.chat.completions.create).toHaveBeenCalledTimes(2);
      expect(fetchResponseRetry.handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should throw an error after maximum retries are exceeded', async () => {
      const apiError = new Error('Persistent API Error');
      (mockGroq.chat.completions.create as jest.Mock).mockRejectedValue(
        apiError
      );

      await expect(
        provider.getChatCompletion(
          chatHistory,
          userMessage,
          fetchedText,
          mockSelectedAssistant
        )
      ).rejects.toThrow(apiError);

      expect(mockGroq.chat.completions.create).toHaveBeenCalledTimes(2);
      expect(fetchResponseRetry.handleRetry).toHaveBeenCalledTimes(1); // Number of retries
    });
  });
});
