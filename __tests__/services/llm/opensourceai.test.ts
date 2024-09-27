import getOpenModelChatCompletion from '@/src/services/llm/opensourceai';
import { Message } from '@/src/types/chat';
import fetchMock from 'jest-fetch-mock';

import { assistant2 as selectedAssistant } from '@/__tests__/test_utils/chat';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
});

describe('getOpenModelChatCompletion', () => {
  const chatHistory: Message[] = [
    { question: 'user', answer: 'Hi', assistant: selectedAssistant.value }
  ];
  const userMessage = 'Hello, how are you?';
  const fetchedText = 'Sample text';
  const serverURL = 'http://localhost/api/chat';
  const serverSecretKey = process.env.NEXT_PUBLIC_SERVER_SECRET_KEY;

  it('should return the correct response message on successful fetch', async () => {
    const mockResponse = { message: "I'm fine, thank you!" };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const response = await getOpenModelChatCompletion(
      chatHistory,
      userMessage,
      fetchedText,
      selectedAssistant,
      serverURL
    );

    const { basePrompt, model, temperature, topP } = selectedAssistant.config;
    expect(response).toEqual(mockResponse.message);
    expect(fetchMock).toHaveBeenCalledWith(serverURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + serverSecretKey
      },
      body: JSON.stringify({
        question: userMessage,
        basePrompt: basePrompt,
        chatHistory,
        selectedModel: model.value,
        fetchedText,
        temperature: temperature,
        topP: topP
      })
    });
  });

  it('should handle network errors correctly', async () => {
    fetchMock.mockReject(new Error('Failed to connect'));

    await expect(
      getOpenModelChatCompletion(
        chatHistory,
        userMessage,
        fetchedText,
        selectedAssistant,
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
        chatHistory,
        userMessage,
        fetchedText,
        selectedAssistant,
        serverURL
      )
    ).rejects.toThrow('Network response was not ok: Internal Server Error');
  });
});
