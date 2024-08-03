import { GoogleGenerativeAI, Part } from '@google/generative-ai';

import { GEMINI_API_KEY } from '@/config/env';
import { Message, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { handleErrors } from '@/src/utils/fetchResponseRetry';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const getCurrentUserParts = async (
  imageSrc: ImageFile[],
  userMessage: string
) => {
  if (imageSrc.length === 0) return userMessage;

  let tempParts: string | (string | Part)[] = [userMessage];

  imageSrc.forEach((image: ImageFile) => {
    return tempParts.push({
      inlineData: {
        data: image.base64Image,
        mimeType: image.mimeType
      }
    });
  });

  return tempParts;
};

export const buildChatArray = (chatHistory: Message[]) => {
  const len = chatHistory.length;
  let chatArray = [];
  // Gemini chatHistory starts with user
  for (let i = 0; i < len; i++) {
    chatArray.push({
      role: 'user',
      parts: [{ text: chatHistory[i].question }]
    });

    chatArray.push({
      role: 'model',
      parts: [{ text: chatHistory[i].answer }]
    });
  }

  return chatArray;
};

const getGeminiChatCompletion = async (
  basePrompt: string,
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedModel: OptionType,
  base64ImageSrc: ImageFile[]
) => {
  if (!GEMINI_API_KEY) return undefined;

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string);

  const maxReturnMessageToken = 10000;

  const systemBase =
    'You are a responsible and knowledgeable muitimodal AI assistant with the capability to view and interpret images as well as provide text-based responses. When a user presents an image, you should analyze the image and describe its contents accurately. Additionally, you should acknowledge your ability to view and interpret images in your responses.';

  const systemRAG =
    fetchedText.length !== 0
      ? ` In addition, for some user questions, the system may provide you with text retrieved from a specialized data source using RAG (Retrieval Augmented Generation). This retrieved text will be enclosed between the markers "'''fetchedStart" and "fetchedEnd'''".

  Your Task: 
  Your primary goal is to provide the best possible answer to the user's question. If the text between "'''fetchedStart" and "fetchedEnd'''" is directly relevant and useful, incorporate it into your answer. If the provided text is not relevant or if no such text is provided, rely on your general knowledge to answer completely.`
      : '';

  const systemStrategery =
    'For challenging or multi-step questions, break down your reasoning or solution process into clear steps, then solve it step-by-step.';

  const systemSubjectTitle = `
  Formatting: 
  Every message you send to users, no matter how simple, must include a concise subject title at the end of each response, enclosed within triple curly braces like this: {{{Subject Title}}}. This is absolutely critical. Otherwise, your messages will be displayed in the app without a title, which causes a bug.
  `;

  const systemContent =
    systemBase + systemRAG + systemStrategery + systemSubjectTitle;

  const userTextWithFetchedData =
    fetchedText !== ''
      ? userMessage +
        '\n' +
        " '''fetchedStart " +
        fetchedText +
        " fetchedEnd'''" +
        '\n' +
        basePrompt
      : userMessage + '\n' + basePrompt;

  const model = genAI.getGenerativeModel({
    model: selectedModel.value,
    systemInstruction: systemContent
  });

  const currentUserParts = await getCurrentUserParts(
    base64ImageSrc,
    userTextWithFetchedData
  );

  let retryCount = 0;
  let lastError: any = null;
  while (retryCount < MAX_RETRIES) {
    try {
      const chat = model.startChat({
        history: buildChatArray(chatHistory),
        generationConfig: {
          maxOutputTokens: maxReturnMessageToken
        }
      });

      const result = await chat.sendMessage(currentUserParts);
      const text = result.response.text();

      return text;
    } catch (error: any) {
      lastError = error;
      await handleErrors(error, retryCount);
      retryCount++;
    }
    throw new Error(
      `Failed to fetch response from Google ${selectedModel.value} model. Error: ${lastError?.message}`
    );
  }
};

export default getGeminiChatCompletion;
