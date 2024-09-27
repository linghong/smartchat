// tokens = (width px * height px)/750
//based on Claude 3.5 Sonnet per-token price of $3 per million input tokens
//image 1092x1092 px(1.19 megapixels)	~1590	~$0.48/100 images
import Anthropic from '@anthropic-ai/sdk';

import { CLAUDE_API_KEY } from '@/config/env';
import { Message, ImageFile, AssistantOption } from '@/src/types/chat';
import {
  buildChatArray,
  ImageBlockParam,
  TextBlockParam
} from '@/src/services/llm/modelHelper';
import {
  multimodalRole,
  baseRole,
  handleRAG,
  beforeRespond,
  subjectTitle,
  beforePresent,
  difficultQuestion
} from '@/src/services/llm/prompt';

export const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
  timeout: 2 * 60 * 1000 // 2 minutes (default is 10 minutes)
});

const isBase64 = (str: string): boolean => {
  try {
    // Try to decode the string
    if (typeof window !== 'undefined') {
      // Browser environment
      window.atob(str);
    } else {
      // Node.js environment
      Buffer.from(str, 'base64').toString('base64');
    }
    return true;
  } catch (e) {
    return false;
  }
};

const contentForUserImage = (
  base64ImageSrc: ImageFile[]
): ImageBlockParam[] => {
  const newImages: ImageBlockParam[] = [];
  base64ImageSrc.forEach(imgSrc => {
    if (
      (imgSrc.base64Image && imgSrc.mimeType === 'image/jpeg') ||
      imgSrc.mimeType === 'image/png' ||
      imgSrc.mimeType === 'image/gif' ||
      imgSrc.mimeType === 'image/webp'
    ) {
      // Validate base64 string
      if (isBase64(imgSrc.base64Image)) {
        newImages.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: imgSrc.mimeType,
            data: imgSrc.base64Image
          }
        });
      } else {
        console.error('Invalid base64 image data');
      }
    }
  });
  return newImages;
};

const getClaudeChatCompletion = async (
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedAssistant: AssistantOption,
  base64ImageSrc: ImageFile[] | undefined
): Promise<string | undefined> => {
  //after testing, when max_token is larger than 4096, it produces an error
  const maxReturnMessageToken = 4096;

  const { model, basePrompt, temperature, topP } = selectedAssistant.config;

  const systemBase = model.vision ? multimodalRole : baseRole;

  const systemRAG = fetchedText.length !== 0 ? handleRAG : '';

  const specialFormating = `
  ### Empty Line 
  Insert an empty line between paragraphs, as well as between classes, functions, and logical sections within code blocks. Follow these steps to determine where to insert an empty line: 
  1.  Identify Paragraph Breaks: Detect transitions between paragraphs by analyzing sentence endings and looking for cues like changes in topic or indentation.
  2.  Recognize Code Blocks: Identify code blocks by detecting code fences or indentation patterns.
  3.  Parse Code Structure: Analyze the code within a code block to identify classes, functions, and logical sections.
  
  `;

  const specialHtmlTag = `
  ### Special Html 
  When providing responses that include HTML formatting, ensure that all tags are properly nested and positioned. Double-check the opening and closing of tags, especially for list items within unordered lists. Pay particular attention to paragraph tags and make sure they don't inappropriately split other elements.
  
  `;

  const systemContent =
    systemBase +
    systemRAG +
    beforeRespond +
    subjectTitle +
    specialFormating +
    specialHtmlTag +
    beforePresent +
    difficultQuestion;

  const chatArray = buildChatArray(chatHistory);

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

  const currentUserContent =
    base64ImageSrc && base64ImageSrc?.length !== 0
      ? [
          {
            type: 'text',
            text: userTextWithFetchedData
          } as TextBlockParam,
          ...contentForUserImage(base64ImageSrc)
        ]
      : userTextWithFetchedData;

  try {
    const message = await anthropic.messages.create({
      model: model.value,
      system: systemContent,
      temperature: temperature,
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

    if (!message || !message.content)
      throw new Error('Chat completion data is undefined.');

    if (Array.isArray(message.content)) {
      let responseContent = '';
      for (const block of message.content) {
        if ('text' in block) {
          responseContent += block.text;
        }
        // Handle other types of blocks as needed
      }
      const formattedText = responseContent.replace(/\n{2,}/g, '\n');
      return formattedText;
    } else {
      return message.content;
    }
  } catch (error: any) {
    console.error(error?.response?.data || error);
    throw error;
  }
};

export default getClaudeChatCompletion;
