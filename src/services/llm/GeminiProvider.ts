import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { Message, ImageFile, AssistantOption } from '@/src/types/chat';
import { BaseAIProvider } from '@/src/services/llm/BaseAIProvider';
import { AIProviderError, AppError } from '@/src/services/llm/CustomErrorTypes';
import {
  multimodalRole,
  beforeRespond,
  beforePresent,
  difficultQuestion
} from '@/src/services/llm/prompt';

export class GeminiProvider extends BaseAIProvider {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private async getCurrentUserParts(
    imageSrc: ImageFile[],
    userMessage: string
  ): Promise<string | (string | Part)[]> {
    if (imageSrc.length === 0) return userMessage;

    return [
      userMessage,
      ...imageSrc.map(image => ({
        inlineData: {
          data: image.base64Image,
          mimeType: image.mimeType
        }
      }))
    ];
  }

  private buildChatArray(chatHistory: Message[]) {
    const chatArray = [];
    for (const message of chatHistory) {
      chatArray.push({
        role: 'user',
        parts: [{ text: message.question }]
      });
      chatArray.push({
        role: 'model',
        parts: [{ text: message.answer }]
      });
    }
    return chatArray;
  }

  public async getChatCompletion(
    chatHistory: Message[],
    userMessage: string,
    fetchedText: string,
    selectedAssistant: AssistantOption,
    base64ImageSrc?: ImageFile[]
  ): Promise<string | undefined> {
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

    When your solution is to modify content user provided to you, no matter it is fixing an error or modifying content, along with your solution, always give user a summarization about the changes you have made and where you made the changes.
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

    const userTextWithFetchedData = this.formatUserMessage(
      userMessage,
      fetchedText,
      basePrompt
    );

    const geminiModel = this.genAI.getGenerativeModel({
      model: model.value,
      systemInstruction: systemContent
    });

    const currentUserParts = await this.getCurrentUserParts(
      base64ImageSrc || [],
      userTextWithFetchedData
    );

    return this.retryOperation(
      async () => {
        try {
          const chat = geminiModel.startChat({
            history: this.buildChatArray(chatHistory),
            generationConfig: {
              maxOutputTokens: maxReturnMessageToken,
              temperature,
              topP
            }
          });

          const result = await chat.sendMessage(currentUserParts);
          if (!result?.response?.text()) {
            throw new AIProviderError('Empty response from Gemini');
          }
          return result.response.text();
        } catch (error) {
          return this.handleError(error, 'Gemini');
        }
      },
      `Failed to fetch response from Google ${model.value} model`,
      4 //maxAttempts
    );
  }
}
