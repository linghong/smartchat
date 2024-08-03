'use strict';
import { buildChatArray } from '@/src/services/llm/openai';
import { Groq } from 'groq-sdk';

import { GROQ_API_KEY } from '@/config/env';
import { Message } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

const buildChatMessages = (
  basePrompt: string,
  systemContent: string,
  userMessage: string,
  fetchedText: string,
  chatHistory: Message[],
  selectedModel: OptionType,
  maxReturnMessageToken: number
): any[] => {
  const chatArray = buildChatArray(
    systemContent,
    userMessage,
    fetchedText,
    chatHistory,
    maxReturnMessageToken,
    selectedModel.contextWindow
  );

  const userMessageWithFetchedData =
    fetchedText !== ''
      ? userMessage +
        '\n' +
        " '''fetchedStart " +
        fetchedText +
        " fetchedEnd'''" +
        '\n' +
        basePrompt
      : userMessage + '\n' + basePrompt;

  return [
    { role: 'system', content: systemContent },
    ...chatArray,
    {
      role: 'user',
      content: userMessageWithFetchedData
    }
  ];
};

export const getGroqChatCompletion = async (
  basePrompt: string,
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedModel: OptionType
) => {
  if (!GROQ_API_KEY) return undefined;

  const groq = new Groq({
    apiKey: GROQ_API_KEY
  });
  const maxReturnMessageToken = 4000;

  const systemBase =
    'You are a responsible and knowledgeable AI assistant. You have access to a vast amount of general knowledge.';

  const systemRAG =
    fetchedText.length !== 0
      ? `In addition, for some user questions, the system may provide AI with text retrieved from a specialized data source using RAG (Retrieval Augmented Generation). This retrieved text will be enclosed between the tag pair "'''fetchedStart" and "fetchedEnd'''". This tag pair is for AI to know the source of the text. Ai assistant is not supposed to disclose the tag pair in your message.
  
  Only use the fetched data if it is directly relevant to the user's question and can contribute to a reasonable correct answer. Otherwise, rely on your pre-existing knowledge to provide the best possible response.`
      : '';

  const systemStrategery = 'For difficult problems, solve it step-by-step.';

  const systemSubjectTitle = `
  Formatting: 
  Every message AI assistant sends to users, no matter how simple, must include a concise subject title at the end of each response, enclosed within triple curly braces like this: {{{write your subject title here}}}. This is absolutely critical because message without title could crash the site.
  `;

  const systemContent =
    systemBase + systemRAG + systemStrategery + systemSubjectTitle;

  //gemma 7b think
  const messages = buildChatMessages(
    basePrompt,
    systemContent,
    userMessage,
    fetchedText,
    chatHistory,
    selectedModel,
    maxReturnMessageToken
  );

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: selectedModel.value,
      temperature: 0,
      max_tokens: maxReturnMessageToken,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 1
    });

    if (!completion || !completion.choices || !completion.choices.length) {
      throw new Error('No completion choices returned from the server.');
    }

    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error('Error:', error);
    throw new Error(
      `Failed to fetch response from Groq server: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
