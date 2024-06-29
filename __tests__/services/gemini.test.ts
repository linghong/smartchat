import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { Message } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import getGeminiChatCompletion, { getCurrentUserParts, buildChatArray }  from '@/src/services/gemini';

jest.mock('@google/generative-ai');

const mockGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>;

describe('getGeminiChatCompletion', () => {
  const basePrompt = "Base Prompt";
  const chatHistory: Message[] = [
    { question: "", answer: "I am an AI assistant. Do you need help?" },
    { question: "Question 1", answer: "Answer 1" }
  ];
  const userMessage = "User Message";
  const fetchedText = "Fetched Text";
  const selectedModel: OptionType = { value: "model-id", label: "Model Label" };
  const base64Images = ["base64image1", "base64image2"];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build chat array correctly', () => {
    const chatArray = buildChatArray(chatHistory);
    expect(chatArray).toEqual([
      { role: 'user', parts: [{ text: "" }] },
      { role: 'model', parts: [{ text: "I am an AI assistant. Do you need help?" }] },
      { role: 'user', parts: [{ text: "Question 1" }] },
      { role: 'model', parts: [{ text: "Answer 1" }] }
    ]);
  });

  it('should build current user parts correctly', async () => {
    const parts = await getCurrentUserParts(base64Images, userMessage);
    expect(parts).toEqual([
      userMessage,
      { inlineData: { data: "base64image1", mimeType: "image/png" } },
      { inlineData: { data: "base64image2", mimeType: "image/png" } }
    ]);
  });

  it('should fetch a response from the Google model', async () => {
    const mockModel = {
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue("Generated Response")
          }
        })
      })
    };
    mockGoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    } as any));

    const result = await getGeminiChatCompletion(basePrompt, chatHistory, userMessage, fetchedText, selectedModel, base64Images);
    expect(result).toBe("Generated Response");
  });

  it('should handle errors gracefully', async () => {
    const mockModel = {
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockRejectedValue(new Error("API Error"))
      })
    };
    mockGoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    } as any));

    await expect(getGeminiChatCompletion(basePrompt, chatHistory, userMessage, fetchedText, selectedModel, base64Images))
      .rejects
      .toThrow("Failed to fetch response from Google model-id model, Error: API Error");
  });
});
