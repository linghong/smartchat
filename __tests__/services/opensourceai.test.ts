
import chatResponseFromOpensource from '@/src/services/opensourceai'
import { Message } from '@/src/types/chat'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

beforeEach(() => {
  fetchMock.resetMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {}) // Mock console.error
  // Reset the secret key before each test
  process.env.NEXT_PUBLIC_SERVER_SECRET_KEY = "secret-key"
});


describe('chatResponseFromOpensource', () => {
  const basePrompt = "Test base prompt"
  const chatHistory: Message[] = [{ question: 'user', answer: 'Hi' }]
  const userMessage = "Hello, how are you?"
  const fetchedText = "Sample text"
  const selectedModel = "test-model"
  const serverURL = "http://localhost/api/chat"
  const serverSecretKey = "secret-key"
  process.env.NEXT_PUBLIC_SERVER_SECRET_KEY = serverSecretKey

  it('should alert when server secret key is missing', async () => {
    delete process.env.NEXT_PUBLIC_SERVER_SECRET_KEY // Ensure the environment variable is not set

    const response = await chatResponseFromOpensource(basePrompt, chatHistory, userMessage, fetchedText, selectedModel, serverURL)
    expect(response).toEqual('Sever secret key is missing')
  })

  it('should return the correct response message on successful fetch', async () => {
    const mockResponse = { message: "I'm fine, thank you!" }
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse))

    const response = await chatResponseFromOpensource(basePrompt, chatHistory, userMessage, fetchedText, selectedModel, serverURL)
    expect(response).toEqual(mockResponse.message)
    expect(fetchMock).toHaveBeenCalledWith(serverURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + serverSecretKey
      },
      body: JSON.stringify({
        question: userMessage,
        basePrompt,
        chatHistory,
        selectedModel,
        fetchedText
      })
    })
  })

  it('should handle network errors correctly', async () => {
    fetchMock.mockReject(new Error("Failed to connect"))

    await expect(chatResponseFromOpensource(basePrompt, chatHistory, userMessage, fetchedText, selectedModel, serverURL))
      .rejects.toThrow("Failed to connect")
  })

  it('should handle non-ok responses correctly', async () => {
    fetchMock.mockResponseOnce('', { status: 500, statusText: 'Internal Server Error' })

    await expect(chatResponseFromOpensource(basePrompt, chatHistory, userMessage, fetchedText, selectedModel, serverURL))
      .rejects.toThrow("Network response was not ok: Internal Server Error")
  })
})