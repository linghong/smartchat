import { getGroqChatCompletion } from '@/src/services/llm/groq';
import { Message, AssistantOption } from '@/src/types/chat';
import { assistant2 } from '@/__tests__/test_utils/chat';

jest.mock('groq-sdk', () => ({
  Groq: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}));

describe('getGroqChatCompletion', () => {
  const mockAssistantOption: AssistantOption = assistant2;

  const chatHistory: Message[] = [
    { question: 'Hello', answer: 'How are you?', assistant: 'llama2-70b-4096' }
  ];
  const userMessage = "What's the weather like?";
  const fetchedText = 'Sunny and 75 degrees';

  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.GROQ_API_KEY = 'fake-api-key';

    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should return a successful response from the Groq API', async () => {
    require('groq-sdk').Groq.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: "It's sunny and 75 degrees{{{Weather Update}}}"
                }
              }
            ]
          })
        }
      }
    }));

    const response = await getGroqChatCompletion(
      chatHistory,
      userMessage,
      fetchedText,
      mockAssistantOption
    );

    expect(response).toEqual("It's sunny and 75 degrees{{{Weather Update}}}");
  });

  it('should throw an error if the completion object is missing', async () => {
    require('groq-sdk').Groq.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(undefined)
        }
      }
    }));

    await expect(
      getGroqChatCompletion(
        chatHistory,
        userMessage,
        fetchedText,
        mockAssistantOption
      )
    ).rejects.toThrow('No completion choices returned from the server.');
  });

  it('should throw an error if the choices array is missing', async () => {
    require('groq-sdk').Groq.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({})
        }
      }
    }));

    await expect(
      getGroqChatCompletion(
        chatHistory,
        userMessage,
        fetchedText,
        mockAssistantOption
      )
    ).rejects.toThrow('No completion choices returned from the server.');
  });

  it('should throw an error if the choices array is empty', async () => {
    require('groq-sdk').Groq.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({ choices: [] })
        }
      }
    }));

    await expect(
      getGroqChatCompletion(
        chatHistory,
        userMessage,
        fetchedText,
        mockAssistantOption
      )
    ).rejects.toThrow('No completion choices returned from the server.');
  });

  it('should handle API failures correctly', async () => {
    require('groq-sdk').Groq.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('API failure'))
        }
      }
    }));

    await expect(
      getGroqChatCompletion(
        chatHistory,
        userMessage,
        fetchedText,
        mockAssistantOption
      )
    ).rejects.toThrow('Failed to fetch response from Groq server: API failure');
  });
});
