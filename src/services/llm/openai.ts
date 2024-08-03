import { OpenAI } from 'openai';
import { encode } from 'gpt-tokenizer';

import { OPENAI_API_KEY } from '@/config/env';
import { Message, ChatType, ChatRole, ImageFile } from '@/src/types/chat';
import { OpenAIChatContentImage } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

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
  basePrompt: string,
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedModel: OptionType,
  base64ImageSrc: ImageFile[] | undefined
): Promise<string | undefined> => {
  const maxReturnMessageToken = selectedModel.contextWindow ? 4096 : 2000;

  const systemBase = selectedModel.vision
    ? `You are an muitimodal AI assistant with the capability to view and interpret images as well as provide text-based responses. When a user presents an image, you should analyze the image and describe its contents accurately. Additionally, you should acknowledge your ability to view and interpret images in your responses.`
    : 'You are a responsible and knowledgeable AI assistant.';

  const systemRAG =
    fetchedText.length !== 0
      ? `You are skilled and equipped with a specialized data source as well as a vast reservoir of general knowledge. When a user presents a question, they can prompt you to extract relevant information from this data source. If information is obtained, it will be flagged with '''fetchedStart and closed with fetchedEnd'''. Only use the fetched data if it is directly relevant to the user's question and can contribute to a reasonable correct answer. Otherwise, rely on your pre-existing knowledge to provide the best possible response.`
      : '';

  const systemStrategery =
    'For challenging or multi-step questions, break down your reasoning or solution process into clear steps, then solve it step-by-step.';

  const systemSpecial =
    selectedModel.value === 'gpt-4'
      ? `Also, only give answer for the question asked, don't provide text not related to the user's question.`
      : '';

  const systemSubjectTitle = `
  Formatting:
  Always include a concise subject title at the end of each response, enclosed within triple curly braces like this: {{{Subject Title}}}.
  `;

  const systemHtmlTag =
    selectedModel.value === 'gpt-4'
      ? 'When presenting information, please ensure to split your responses into paragraphs using <p> HTML tag. If you are providing a list, use the <ul> and <li> tags for unordered lists, <ol> and <li> tags for ordered lists. Highlight the important points using <strong> tag for bold text. Always remember to close any HTML tags that you open.'
      : '';

  const systemContent =
    systemBase +
    systemRAG +
    +systemStrategery +
    systemSpecial +
    systemSubjectTitle +
    systemHtmlTag;

  const chatArray = buildChatArray(
    systemContent,
    userMessage,
    fetchedText,
    chatHistory,
    maxReturnMessageToken,
    selectedModel.contextWindow
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
      model: selectedModel.value,
      temperature: 0,
      max_tokens: maxReturnMessageToken,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 1,
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
      console.log(`AI message isn't complete.`);

    let message = completion.choices[0].message?.content ?? '';

    message =
      selectedModel.value === 'gpt-4'
        ? message
        : message.replace(/\n/g, '<br>');

    return message;
  } catch (error: any) {
    console.error(error.response.data);
    throw error;
  }
};
