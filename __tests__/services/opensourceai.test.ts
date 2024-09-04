import getOpenModelChatCompletion from '@/src/services/llm/opensourceai';
import { Message } from '@/src/types/chat';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
});

describe('getOpenModelChatCompletion', () => {
  const aiConfig = {
    name: 'gpt4-assistant-1',
    role: 'writing',
    model: {
      value: 'gpt-4',
      label: 'gpt 4',
      contextWindow: 128000,
      vision: true
    },
    basePrompt: 'Test base prompt',
    topP: 1,
    temperature: 0
  };
  const chatHistory: Message[] = [
    { question: 'user', answer: 'Hi', model: 'gpt-4' }
  ];
  const userMessage = 'Hello, how are you?';
  const fetchedText = 'Sample text';
  const selectedModel = {
    value: 'test-model',
    label: 'test model'
  };
  const serverURL = 'http://localhost/api/chat';
  const serverSecretKey = process.env.NEXT_PUBLIC_SERVER_SECRET_KEY;

  it('should return the correct response message on successful fetch', async () => {
    const mockResponse = { message: "I'm fine, thank you!" };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const response = await getOpenModelChatCompletion(
      aiConfig,
      chatHistory,
      userMessage,
      fetchedText,
      selectedModel,
      serverURL
    );
    expect(response).toEqual(mockResponse.message);
    expect(fetchMock).toHaveBeenCalledWith(serverURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + serverSecretKey
      },
      body: JSON.stringify({
        question: userMessage,
        basePrompt: aiConfig.basePrompt,
        chatHistory,
        selectedModel: selectedModel.value,
        fetchedText
      })
    });
  });

  it('should handle network errors correctly', async () => {
    fetchMock.mockReject(new Error('Failed to connect'));

    await expect(
      getOpenModelChatCompletion(
        aiConfig,
        chatHistory,
        userMessage,
        fetchedText,
        selectedModel,
        serverURL
      )
    ).rejects.toThrow('Failed to connect');
  });

  it('should handle non-ok responses correctly', async () => {
    fetchMock.mockResponseOnce('', {
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(
      getOpenModelChatCompletion(
        aiConfig,
        chatHistory,
        userMessage,
        fetchedText,
        selectedModel,
        serverURL
      )
    ).rejects.toThrow('Network response was not ok: Internal Server Error');
  });
});
