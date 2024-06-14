'use strict'
import { buildChatArray } from './openai'
import { Groq } from 'groq-sdk'

import { GROQ_API_KEY } from '@/config/env'
import { Message } from '@/src/types/chat'
import { OptionType } from '@/src/types/common'

const buildChatMessages = (
  basePrompt: string,
  systemContent: string,
  userMessage: string,
  fetchedText: string,
  chatHistory: Message[],
  selectedModel: OptionType,
  maxReturnMessageToken: number,
): any[] => {
  const chatArray = buildChatArray(
    systemContent,
    userMessage,
    fetchedText,
    chatHistory,
    maxReturnMessageToken,
    selectedModel.contextWindow,
  )

  const userMessageWithFetchedData =
    fetchedText !== ''
      ? userMessage +
        '\n' +
        " '''fetchedStart " +
        fetchedText +
        " fetchedEnd'''" +
        '\n' +
        basePrompt
      : userMessage + '\n' + basePrompt

  return [
    { role: 'system', content: systemContent },
    ...chatArray,
    {
      role: 'user',
      content: userMessageWithFetchedData,
    },
  ]
}

export const getGroqChatCompletion = async (
  basePrompt: string,
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedModel: OptionType,
) => {
  if (!GROQ_API_KEY) return undefined

  const groq = new Groq({
    apiKey: GROQ_API_KEY,
  })
  const maxReturnMessageToken = 4000

  const systemContent = `You are a responsible and knowledgeable AI assistant. You have access to a vast amount of general knowledge. In addition, for some user questions, the system may provide you with text retrieved from a specialized data source using RAG (Retrieval Augmented Generation). This retrieved text will be enclosed between the markers "'''fetchedStart" and "fetchedEnd'''". 
  
  Only use the fetched data if it is directly relevant to the user's question and can contribute to a reasonable correct answer. Otherwise, rely on your pre-existing knowledge to provide the best possible response. For difficult problems, solve step-by-step.

  Formatting: 
  Always include a concise subject title at the end of each response, enclosed within triple curly braces like this: "{{{write your subject title here}}}".
  `

  //gemma 7b think
  const messages = buildChatMessages(
    basePrompt,
    systemContent,
    userMessage,
    fetchedText,
    chatHistory,
    selectedModel,
    maxReturnMessageToken,
  )

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: selectedModel.value,
      temperature: 0,
      max_tokens: maxReturnMessageToken,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 1,
    })

    if (!completion || !completion.choices || !completion.choices.length) {
      throw new Error('No completion choices returned from the server.')
    }

    return completion.choices[0]?.message?.content
  } catch (error) {
    console.error('Error:', error)
    throw new Error(
      `Failed to fetch response from Groq server: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
