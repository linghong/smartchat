import type { NextApiRequest, NextApiResponse } from 'next'
import {  createEmbedding, getChatResponse } from '@/src/services/openai'
import { fetchDataFromPinecone } from '@/src/services/fetchDataFromPinecone'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, nameSpace, selectedModel, chatHistory } = req.body

  if (!selectedModel.value) return res.status(500).json('Something went wrong')

  //only accept post requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' })
  }
  // replacing newlines with spaces
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ')

  try {
    const embeddedQuery = await createEmbedding(question)
    const fetchedText = await fetchDataFromPinecone(embeddedQuery, nameSpace)

    const chatResponse = await getChatResponse(chatHistory, sanitizedQuestion, fetchedText, selectedModel.value)

    const chatAnswer = chatResponse?? 'I am sorry. I can\'t find an answer to your question.'
    console.log(chatAnswer)
    res.status(200).json(chatAnswer)
  
  } catch (error: any) {
    console.error('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' })
  }
}
