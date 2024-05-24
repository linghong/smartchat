"use strict"

import { Message } from '@/src/types/chat'
import { buildChatArray } from './openai'
import { Groq } from "groq-sdk"


export const getGroqChatCompletion = async (basePrompt:string, chatHistory: Message[], userMessage: string, fetchedText: string,  selectedModel: string) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('Missing GROQ API key')

  const groq = new Groq({
    apiKey: GROQ_API_KEY
  })
  const maxReturnMessageToken = 10000

  const htmlTagContent = selectedModel === 'gpt-4' ? 'When presenting information, please ensure to split your responses into paragraphs using <p> HTML tag. If you are providing a list, use the <ul> and <li> tags for unordered lists, <ol> and <li> tags for ordered lists. Highlight the important points using <strong> tag for bold text. Always remember to close any HTML tags that you open. when presenting code, add necessary html tag to split the lines to make it looks as if it is written in an ID.E' : ''

  const systemContent = "You are an AI assistant, skilled and equipped with a specialized data source as well as a vast reservoir of general knowledge. When a user presents a question, they can prompt you to extract relevant information from this data source. If information is obtained, it will be flagged with '''fetchedStart and closed with fetchedEnd'''. Only use the fetched data if it is directly relevant to the user's question and can contribute to a reasonable correct answer. Otherwise, rely on your pre-existing knowledge to provide the best possible response. For difficult problems, solve step-by-step." + htmlTagContent

  const buildChatMessages = (systemContent: string, userMessage: string, fetchedText: string, chatHistory: Message[], maxReturnMessageToken: number): any[]  => {
    const chatArray = buildChatArray(systemContent, userMessage, fetchedText, chatHistory, maxReturnMessageToken)

    const userMessageWithFetchedData = fetchedText!=='' ? userMessage + '\n' + " '''fetchedStart " + fetchedText + " fetchedEnd'''"+ '\n'+ basePrompt : userMessage +'\n' + basePrompt

    return [
      {role: "system", 
      content: systemContent
      }, 
      ...chatArray,
      { 
      role: "user", 
      content: userMessageWithFetchedData
    }]
  }
  
  const messages = buildChatMessages(systemContent, userMessage, fetchedText, chatHistory, maxReturnMessageToken)

  try {
      const completion = await groq.chat.completions.create({
        messages,
        model: selectedModel,
        temperature: 0,
        max_tokens: maxReturnMessageToken,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 1
      })

      if (!completion || !completion.choices || !completion.choices.length) {
        throw new Error('No completion choices returned from the server.');
      }

    return completion.choices[0]?.message?.content

  } catch(error){
    console.error('Error:', error)
    throw new Error(`Failed to fetch response from Groq server: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } 
}