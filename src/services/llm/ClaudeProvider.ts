// tokens = (width px * height px)/750
//based on Claude 3.5 Sonnet per-token price of $3 per million input tokens
//image 1092x1092 px(1.19 megapixels)	~1590	~$0.48/100 images
import '@anthropic-ai/sdk/shims/node'; //this ensures that the fetch API is available when testing
import Anthropic from '@anthropic-ai/sdk';
import { Message, ImageFile, AssistantOption } from '@/src/types/chat';
import { BaseAIProvider } from '@/src/services/llm/BaseAIProvider';
import {
  multimodalRole,
  baseRole,
  handleRAG,
  beforeRespond,
  subjectTitle,
  beforePresent,
  difficultQuestion
} from '@/src/services/llm/prompt';

export class ClaudeProvider extends BaseAIProvider {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    super(apiKey);
    this.anthropic = new Anthropic({
      apiKey,
      timeout: 2 * 60 * 1000 // 2 minutes (default is 10 minutes)
    });
  }

  private isBase64(str: string): boolean {
    try {
      // decode the string in browser environment
      if (typeof window !== 'undefined') {
        window.atob(str);

        // decode the string in node.js environment
      } else {
        Buffer.from(str, 'base64').toString('base64');
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  private contentForUserImage(base64ImageSrc: ImageFile[]) {
    return base64ImageSrc
      .filter(
        imgSrc =>
          imgSrc.base64Image &&
          ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
            imgSrc.mimeType
          ) &&
          this.isBase64(imgSrc.base64Image)
      )
      .map(imgSrc => ({
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: imgSrc.mimeType as
            | 'image/jpeg'
            | 'image/png'
            | 'image/gif'
            | 'image/webp',
          data: imgSrc.base64Image
        }
      }));
  }

  private buildChatArray = (
    chatHistory: Message[]
  ): Anthropic.Messages.MessageParam[] => {
    return chatHistory.slice(1).flatMap(chat => [
      {
        role: 'user',
        content: chat.question
      },
      {
        role: 'assistant',
        content: chat.answer
      }
    ]);
  };

  public async getChatCompletion(
    chatHistory: Message[],
    userMessage: string,
    fetchedText: string,
    selectedAssistant: AssistantOption,
    base64ImageSrc?: ImageFile[]
  ): Promise<string | undefined> {
    //after testing, when max_token is larger than 4096, it produces an error
    const maxReturnMessageToken = 4096;

    const { model, basePrompt, temperature, topP } = selectedAssistant.config;
    const systemContent = this.buildSystemContent(model.vision, fetchedText);

    const chatArray = this.buildChatArray(chatHistory);

    const userTextWithFetchedData = this.formatUserMessage(
      userMessage,
      fetchedText,
      basePrompt
    );

    const currentUserContent =
      base64ImageSrc && base64ImageSrc.length !== 0
        ? [
            {
              type: 'text',
              text: userTextWithFetchedData
            } as Anthropic.TextBlockParam,
            ...this.contentForUserImage(base64ImageSrc)
          ]
        : userTextWithFetchedData;

    return this.retryOperation(
      async () => {
        try {
          const message = await this.anthropic.messages.create({
            model: model.value,
            system: systemContent,
            temperature,
            max_tokens: maxReturnMessageToken,
            top_p: topP,
            messages: [
              ...chatArray,
              {
                role: 'user',
                content: currentUserContent
              }
            ]
          });

          if (!message || !message.content) {
            throw new Error('Chat completion data is undefined.');
          }

          if (Array.isArray(message.content)) {
            let responseContent = message.content
              .map(block => ('text' in block ? block.text : ''))
              .join('');
            return responseContent.replace(/\n{2,}/g, '\n');
          } else {
            return message.content;
          }
        } catch (error) {
          return this.handleError(error, 'Claude');
        }
      },
      'Failed to fetch response from Claude model',
      2 //maxAttempts
    );
  }

  private buildSystemContent(
    isVision: boolean | undefined,
    fetchedText: string
  ): string {
    const systemBase = isVision ? multimodalRole : baseRole;
    const systemRAG = fetchedText.length !== 0 ? handleRAG : '';
    const specialFormatting = `
      ### Empty Line 
      Insert an empty line between paragraphs, as well as between classes, functions, and logical sections within code blocks.
    `;
    const specialHtmlTag = `
      ### Special Html 
      Ensure that all HTML tags are properly nested and positioned.
    `;

    return (
      systemBase +
      systemRAG +
      beforeRespond +
      subjectTitle +
      specialFormatting +
      specialHtmlTag +
      beforePresent +
      difficultQuestion
    );
  }
}
