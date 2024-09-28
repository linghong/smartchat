'use strict';
import { Groq } from 'groq-sdk';

import { GROQ_API_KEY } from '@/config/env';
import { buildChatArray } from '@/src/services/llm/modelHelper';
import { Message, AssistantOption } from '@/src/types/chat';

const buildChatMessages = (
  basePrompt: string,
  systemContent: string,
  userMessage: string,
  fetchedText: string,
  chatHistory: Message[]
): any[] => {
  const chatArray = buildChatArray(chatHistory);

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
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedAssistant: AssistantOption
) => {
  if (!GROQ_API_KEY) return undefined;

  const { model, basePrompt, temperature, topP } = selectedAssistant.config;

  const maxReturnMessageToken = 4000;

  const systemBase =
    'You are a responsible and knowledgeable AI assistant. You have access to a vast amount of general knowledge.';

  const systemRAG =
    fetchedText.length !== 0
      ? `
      ## Handling Information Retrieval (RAG):
      In addition, for some user questions, the system may provide AI with text retrieved from a specialized data source using RAG (Retrieval Augmented Generation). This retrieved text will be enclosed between the tag pair "'''fetchedStart" and "fetchedEnd'''". This tag pair is for AI to know the source of the text. AI assistant is not supposed to disclose the tag pair in the message.
  
  Only use the fetched data if it is directly relevant to the user's question and can contribute to a reasonable correct answer. Otherwise, rely on your pre-existing knowledge to provide the best possible response.
  
  `
      : '';

  const systemStrategery = 'For difficult problems, solve it step-by-step.';

  const systemSubjectTitle =
    selectedAssistant.config.model.value !== 'llama-3.2-1b-preview'
      ? `
 ## Formatting:
  For every message you send to users, no matter how simple, you must include a very concise subject title at the END of your response. This title should come after all other content in your message. Enclose the title within triple curly braces like this: {{{Subject Title Goes Here}}}. This placement at the end is absolutely critical.
  
  `
      : '';

  const systemContent =
    systemBase + systemRAG + systemStrategery + systemSubjectTitle;

  //gemma 7b think
  const messages = buildChatMessages(
    basePrompt,
    systemContent,
    userMessage,
    fetchedText,
    chatHistory
  );

  const groq = new Groq({
    apiKey: GROQ_API_KEY
  });
  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: model.value,
      temperature: temperature,
      max_tokens: maxReturnMessageToken,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: topP
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
