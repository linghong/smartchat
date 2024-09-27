import { GoogleGenerativeAI, Part } from '@google/generative-ai';

import { GEMINI_API_KEY } from '@/config/env';
import {
  multimodalRole,
  beforeRespond,
  beforePresent,
  difficultQuestion
} from '@/src/services/llm/prompt';
import { Message, ImageFile, AssistantOption } from '@/src/types/chat';
import { handleErrors } from '@/src/utils/fetchResponseRetry';

const MAX_RETRIES = 3;

export const getCurrentUserParts = async (
  imageSrc: ImageFile[],
  userMessage: string
): Promise<string | (string | Part)[]> => {
  if (imageSrc.length === 0) return userMessage;

  let tempParts: (string | Part)[] = [userMessage];

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
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedAssistant: AssistantOption,
  base64ImageSrc: ImageFile[]
) => {
  if (!GEMINI_API_KEY) return undefined;

  const { model, basePrompt, temperature, topP } = selectedAssistant.config;

  const maxReturnMessageToken = 10000;

  const specialRule = `You strictly adhere to the requirement of system prompt. You prioritize accuracy over speed, hence, you always double check your response before send it out to users, even if it will take longer to produce your response. When a user presents an image, you should analyze the image and describe its contents accurately. If your user only provides text, just focus on providing responses relevant to the text input.
  
  `;

  const systemRAG =
    fetchedText.length !== 0
      ? `
      ## RAG
      In addition, for some user questions, the system may provide you with text retrieved from a specialized data source using RAG (Retrieval Augmented Generation). This retrieved text will be enclosed between the markers "'''fetchedStart" and "fetchedEnd'''".

      Your Task: 
      Your primary goal is to provide the best possible answer to the user's question. If the text between "'''fetchedStart" and "fetchedEnd'''" is directly relevant and useful, incorporate it into your answer. If the provided text is not relevant or if no such text is provided, rely on your general knowledge to answer completely.
      
      `
      : '';

  const systemSubjectTitle = `
  ## Formatting:
  ### Message Title
  Every message you send to users, no matter how simple, you must include a concise subject title at the end of each response, enclosed within triple curly braces like this: {{{Subject Title}}}. This is absolutely critical. Otherwise, your messages will be displayed in the app without a title, which will cause a serious bug.

  `;

  const specialFormatting = `
  ### Response Formatting
  When a user question is not a simple question for which you can't quickly give an answer, your response should first acknowledge that you understand what the user wants you to do, then provide your solution.

  When your solution is to modify content user provided to you, no matter it is fixing an error or modifying content, along with your solution, always give user a summarization about the changes you have made  and where you made the changes.
  
  `;

  const systemContent =
    multimodalRole +
    specialRule +
    systemRAG +
    beforeRespond +
    systemSubjectTitle +
    specialFormatting +
    beforePresent +
    difficultQuestion;

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

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string);
  const geminiModel = genAI.getGenerativeModel({
    model: model.value,
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
      const chat = geminiModel.startChat({
        history: buildChatArray(chatHistory),
        generationConfig: {
          maxOutputTokens: maxReturnMessageToken,
          temperature: temperature,
          topP: topP
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
      `Failed to fetch response from Google ${model.value} model. Error: ${lastError?.message}`
    );
  }
};

export default getGeminiChatCompletion;
