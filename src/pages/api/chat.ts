import type { NextApiRequest, NextApiResponse } from 'next'

import {  createEmbedding, getChatResponse } from '@/src/services/openai'
import { fetchDataFromPinecone } from '@/src/services/fetchDataFromPinecone'
import chatResponseFromOpensource from '@/src/services/opensourceai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { basePrompt, question, namespace, selectedModel, chatHistory } = req.body

  if (!selectedModel.value) return res.status(500).json('Something went wrong')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' })
  }
  // replacing newlines with spaces
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ')

  let fetchedText = ''
  try {
    //fetch text from vector database
    if(namespace !== 'none') {
      const embeddedQuery = await createEmbedding(question)
      fetchedText = await fetchDataFromPinecone(embeddedQuery, namespace)
    }

    // get response from AI
    const { value } = selectedModel
    let chatResponse;
    if(value === 'gpt-3.5-turbo' || selectedModel === 'gpt-3.5-turbo-16k' || selectedModel === 'gpt-4') {
      chatResponse = await getChatResponse(basePrompt, chatHistory, sanitizedQuestion, fetchedText, selectedModel.value)

    } else {
        chatResponse = await chatResponseFromOpensource(basePrompt, chatHistory, sanitizedQuestion, fetchedText, selectedModel.value)
    }
   
    const chatAnswer = chatResponse?? 'I am sorry. I can\'t find an answer to your question.'

    res.status(200).json(chatAnswer)
  
  } catch (error: any) {
    console.error('An error occurred: ', error);
    res.status(500).json({ error: error.message || 'Something went wrong' })
  }
}
