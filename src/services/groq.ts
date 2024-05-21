"use strict"

import { Message, ChatType, ChatRole } from '@/src/types/chat'
import { buildChatArray } from './openai.ts'
const Groq = require("groq-sdk")

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) throw new Error('Missing GROQ API key');

const groq = new Groq({
    apiKey: GROQ_API_KEY
})

export const getGroqChatCompletion = async (basePrompt:string, chatHistory: Message[], userMessage: string, fetchedText: string,  selectedModel: string) => {
  const maxReturnMessageToken = 2000

  const systemContent = "You are an AI assistant, skilled and equipped with a specialized data source as well as a vast reservoir of general knowledge. When a user presents a question, they can prompt you to extract relevant information from this data source. If information is obtained, it will be flagged with '''fetchedStart and closed with fetchedEnd'''. Only use the fetched data if it is directly relevant to the user's question and can contribute to a reasonable correct answer. Otherwise, rely on your pre-existing knowledge to provide the best possible response. For difficult problems, solve step-by-step."

  const chatArray = buildChatArray(systemContent, userMessage, fetchedText, chatHistory, maxReturnMessageToken)

  const userMessageWithFetchedData = fetchedText!=='' ? userMessage + '\n' + " '''fetchedStart " + fetchedText + " fetchedEnd'''"+ '\n'+ basePrompt : userMessage +'\n' + basePrompt
  console.log(userMessage, selectedModel)

  try {
      const completion = await groq.chat.completions.create({
        messages: [
          {role: "system", 
          content: systemContent
          }, 
          ...chatArray,
          { 
          role: "user", 
          content: userMessageWithFetchedData
        }],
        model: selectedModel,
        temperature: 0,
        max_tokens: maxReturnMessageToken,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 1
      })

      if (!completion) throw new Error('Chat completion data is undefined.')

    return completion.choices[0]?.message?.content || ""

  } catch(e){
    console.error('error', error)
    throw new Error('Failed to fetch response from Groq server')
  } 
}