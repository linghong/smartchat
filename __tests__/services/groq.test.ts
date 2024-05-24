import 'openai/shims/node'
import { getGroqChatCompletion } from '@/src/services/groq'
import { Message } from '@/src/types/chat'

jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      createCompletion: jest.fn().mockResolvedValue({
        choices: [{ message: { content: "Mock openai response" } }]
      })
    }))
  }
})

jest.mock('groq-sdk', () => ({
  Groq: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}))

describe('getGroqChatCompletion', () => {
  const basePrompt = "Hello, how can I help?"
  const chatHistory: Message[] = [{ question: 'Hello', answer: 'How are you?' }]
  const userMessage = "What's the weather like?"
  const fetchedText = "Sunny and 75 degrees"
  const selectedModel = 'LLama3-8b'

  let consoleSpy: jest.SpyInstance

  beforeEach(() => {  
    jest.resetAllMocks()
    process.env.GROQ_API_KEY = 'fake-api-key'
    
    // Mock console.error to prevent it from logging during tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore the original console.error after each test
    consoleSpy.mockRestore()
  })

  it('should throw an error if GROQ API key is missing', async () => {
    delete process.env.GROQ_API_KEY

    await expect(getGroqChatCompletion(basePrompt, chatHistory, userMessage, fetchedText, selectedModel))
      .rejects.toThrow('Missing GROQ API key')
  })

  it('should return a successful response from the Groq API', async () => {
    require('groq-sdk').Groq.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
              choices: [{ 
                message: { content: "It's sunny and 75 degrees" } 
              }]
          })
        }
      }
    }))

    const response = await getGroqChatCompletion(basePrompt, chatHistory, userMessage, fetchedText, selectedModel)
    
    expect(response).toEqual("It's sunny and 75 degrees")
  });

  it('should throw an error if the completion object is missing', async () => {
    require('groq-sdk').Groq.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(undefined)  // Explicitly return undefined
        }
      }
    }))

    await expect(getGroqChatCompletion(basePrompt, chatHistory, userMessage, fetchedText, selectedModel))
      .rejects.toThrow('No completion choices returned from the server.')
  })

  it('should throw an error if the choices array is missing', async () => {
    require('groq-sdk').Groq.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({})
        }
      }
    }))

    await expect(getGroqChatCompletion(basePrompt, chatHistory, userMessage, fetchedText, selectedModel))
      .rejects.toThrow('No completion choices returned from the server.')
  })

  it('should throw an error if the choices array is empty', async () => {
    require('groq-sdk').Groq.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({ choices: [] })
        }
      }
    }))

    await expect(getGroqChatCompletion(basePrompt, chatHistory, userMessage, fetchedText, selectedModel))
      .rejects.toThrow('No completion choices returned from the server.')
  })

  it('should handle API failures correctly', async () => {
     require('groq-sdk').Groq.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('API failure'))
        }
      }
    }))
  
    await expect(getGroqChatCompletion(basePrompt, chatHistory, userMessage, fetchedText, selectedModel))
      .rejects.toThrow('Failed to fetch response from Groq server: API failure')
  })
})
