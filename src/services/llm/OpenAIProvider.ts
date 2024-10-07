import 'openai/shims/node';
import { OpenAI } from 'openai';
import { encode } from 'gpt-tokenizer';
import {
  Message,
  ChatType,
  ChatRole,
  ImageFile,
  OpenAIChatContentImage,
  AssistantOption
} from '@/src/types/chat';
import { BaseAIProvider } from './BaseAIProvider';
import {
  multimodalRole,
  baseRole,
  handleRAG,
  beforeRespond,
  subjectTitle,
  beforePresent,
  difficultQuestion
} from '@/src/services/llm/prompt';

export class OpenAIProvider extends BaseAIProvider {
  private openai: OpenAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.openai = new OpenAI({ apiKey });
  }

  private buildOpenAIChatArray(
    systemContent: string,
    userMessage: string,
    fetchedText: string,
    chatHistory: Message[],
    maxReturnMessageToken: number,
    contextWindow?: number
  ): ChatType[] {
    // after comparing the token count received from OpenAI, it seems that counting tokens in the way shown below matches better with Open AI's token number.
    const tokenCount = (role: ChatRole, str: string) =>
      encode(`role ${role} content ${str} `).length;
    let tokenUsed =
      tokenCount('system', systemContent) +
      tokenCount('assistant', fetchedText) +
      tokenCount('user', userMessage);
    let tokenLeft = (contextWindow ?? 4000) - tokenUsed - maxReturnMessageToken;

    const chatArray: ChatType[] = [];
    for (let i = chatHistory.length - 1; i >= 0 && tokenLeft > 0; i--) {
      const chat = chatHistory[i];
      chatArray.unshift({
        role: 'user',
        content: chat.question
      });
      chatArray.unshift({
        role: 'assistant',
        content: chat.answer
      });
      tokenLeft -=
        tokenCount('user', chat.question) +
        tokenCount('assistant', chat.answer);
    }

    return chatArray;
  }

  private contentForUserImage(
    base64ImageSrc: ImageFile[]
  ): OpenAIChatContentImage[] {
    return base64ImageSrc.map(imgSrc => ({
      type: 'image_url',
      image_url: {
        url: `data:${imgSrc.mimeType};base64,${imgSrc.base64Image}`,
        detail: 'low'
      }
    }));
  }

  public async getChatCompletion(
    chatHistory: Message[],
    userMessage: string,
    fetchedText: string,
    selectedAssistant: AssistantOption,
    base64ImageSrc?: ImageFile[]
  ): Promise<string | undefined> {
    const { model, basePrompt, temperature, topP } = selectedAssistant.config;
    const maxReturnMessageToken = model.contextWindow ? 4096 : 2000;

    const systemBase = model.vision ? multimodalRole : baseRole;
    const specialHtmlTag = `
    ### Special Html Formatting
    When presenting information, please ensure to split your responses into paragraphs using <p> HTML tag. If you are providing a list, use the <ul> and <li> tags for unordered lists, <ol> and <li> tags for ordered lists. Highlight the important points using <strong> tag for bold text. Always remember to close any HTML tags that you open.
    `;

    const systemRAG = fetchedText.length !== 0 ? handleRAG : '';
    const systemContent =
      systemBase +
      systemRAG +
      beforeRespond +
      subjectTitle +
      (model.value === 'gpt-4' ? specialHtmlTag : '') +
      beforePresent +
      difficultQuestion;

    const chatArray = this.buildOpenAIChatArray(
      systemContent,
      userMessage,
      fetchedText,
      chatHistory,
      maxReturnMessageToken,
      model.contextWindow
    );

    const userTextWithFetchedData = this.formatUserMessage(
      userMessage,
      fetchedText,
      basePrompt
    );

    const imageContent =
      base64ImageSrc && base64ImageSrc.length !== 0
        ? this.contentForUserImage(base64ImageSrc)
        : [];

    return this.retryOperation(
      async () => {
        try {
          const completion = await this.openai.chat.completions.create({
            model: model.value,
            temperature,
            max_tokens: maxReturnMessageToken,
            frequency_penalty: 0,
            presence_penalty: 0,
            top_p: topP,
            messages: [
              { role: 'system', content: systemContent },
              ...chatArray,
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: userTextWithFetchedData
                  },
                  ...imageContent
                ]
              }
            ]
          });

          if (!completion)
            throw new Error('Chat completion data is undefined.');
          if (!completion.usage)
            throw new Error('Chat completion usage data is undefined.');
          if (completion.choices[0].finish_reason !== 'stop')
            console.warn(`AI message isn't complete.`);

          let message = completion.choices[0].message?.content ?? '';
          message =
            model.value === 'gpt-4' ? message : message.replace(/\n/g, '<br>');

          return message;
        } catch (error) {
          return this.handleError(error, 'OpenAI');
        }
      },
      `Failed to fetch response from OpenAI ${model.value} model`,
      2 // maxAttempts
    );
  }
}
