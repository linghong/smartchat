import { OpenAI } from 'openai';
import { encode } from 'gpt-tokenizer';

import { OPENAI_API_KEY } from '@/config/env';
import {
  multimodalRole,
  baseRole,
  handleRAG,
  beforeRespond,
  subjectTitle,
  beforePresent,
  difficultQuestion
} from '@/src/services/llm/prompt';
import {
  Message,
  ChatType,
  ChatRole,
  ImageFile,
  OpenAIChatContentImage,
  AssistantOption
} from '@/src/types/chat';

export const openaiClient = new OpenAI({
  apiKey: OPENAI_API_KEY
});

export const createEmbedding = async (text: string): Promise<number[]> => {
  const embedding = await openaiClient.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });

  return embedding.data[0].embedding;
};

export const buildChatArray = (
  systemContent: string,
  userMessage: string,
  fetchedText: string,
  chatHistory: Message[],
  maxReturnMessageToken: number,
  contextWindow: number | undefined
) => {
  // after comparing the token count received from OpenAI, it seems that counting tokens in the way shown below matches better with Open AI's token number.
  const tokenCount = (role: ChatRole, str: string) => {
    return encode(`role ${role} content ${str} `).length;
  };
  const tokenUsed =
    tokenCount('system', systemContent) +
    tokenCount('assistant', fetchedText) +
    tokenCount('user', userMessage);
  let tokenLeft = contextWindow ?? 4000 - tokenUsed - maxReturnMessageToken;

  let chatArray: ChatType[] = [];

  let len = chatHistory.length;
  tokenLeft -=
    tokenCount('user', chatHistory[len - 1].question) +
    tokenCount('assistant', chatHistory[len - 1].answer);

  for (let i = chatHistory.length - 1; i >= 0 && tokenLeft > 0; i--) {
    const chat = chatHistory[i];
    chatArray.push({
      role: 'assistant',
      content: chat.answer
    });
    chatArray.push({
      role: 'user',
      content: chat.question
    });
    tokenLeft -=
      tokenCount('user', chat.question) + tokenCount('assistant', chat.answer);
  }
  chatArray.reverse();

  return chatArray;
};

const contentForUserImage = (
  base64ImageSrc: ImageFile[]
): OpenAIChatContentImage[] =>
  base64ImageSrc.map(imgSrc => ({
    type: 'image_url',
    image_url: {
      url: `data:image/jpeg;base64,${imgSrc.base64Image}`,
      detail: 'low'
    }
  }));

export const getOpenAIChatCompletion = async (
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedAssistant: AssistantOption,
  base64ImageSrc: ImageFile[] | undefined
): Promise<string | undefined> => {
  const { model, basePrompt, temperature, topP } = selectedAssistant.config;

  const maxReturnMessageToken = model.contextWindow ? 4096 : 2000;

  const systemBase = model.vision ? multimodalRole : baseRole;

  const specialHtmlTag = `
  ### Special Html Formatting
  When presenting information, please ensure to split your responses into paragraphs using <p> HTML tag. If you are providing a list, use the <ul> and <li> tags for unordered lists, <ol> and <li> tags for ordered lists. Highlight the important points using <strong> tag for bold text. Always remember to close any HTML tags that you open.
  
  `;

  const systemRAG = fetchedText.length !== 0 ? handleRAG : '';

  const systemHtmlTag = model.value === 'gpt-4' ? specialHtmlTag : '';

  const systemContent =
    systemBase +
    systemRAG +
    beforeRespond +
    subjectTitle +
    systemHtmlTag +
    beforePresent +
    difficultQuestion;

  const chatArray = buildChatArray(
    systemContent,
    userMessage,
    fetchedText,
    chatHistory,
    maxReturnMessageToken,
    model.contextWindow
  );

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

  const imageContent =
    base64ImageSrc && base64ImageSrc?.length !== 0
      ? contentForUserImage(base64ImageSrc)
      : [];

  try {
    const completion = await openaiClient.chat.completions.create({
      model: model.value,
      temperature: temperature,
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

    if (!completion) throw new Error('Chat completion data is undefined.');
    if (!completion.usage)
      throw new Error('Chat completion data is undefined.');
    if (completion.choices[0].finish_reason !== 'stop')
      console.warn(`AI message isn't complete.`);

    let message = completion.choices[0].message?.content ?? '';

    message =
      model.value === 'gpt-4' ? message : message.replace(/\n/g, '<br>');

    return message;
  } catch (error: any) {
    console.error(error.response.data);
    throw error;
  }
};
