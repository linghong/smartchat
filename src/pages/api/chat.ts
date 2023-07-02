import type { NextApiRequest, NextApiResponse } from 'next'
import { getChatResponse } from '@/src/services/openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, nameSpace, chatHistory } = req.body

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' })
  }
  // replacing newlines with spaces
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ')

  try {
    const chatResponse = await getChatResponse(sanitizedQuestion)
    const chatAnswer = chatResponse?.content || 'I am sorry. I can\'t find an answer to your question.'
    console.log('AI response', chatAnswer);
    res.status(200).json(chatAnswer);
  
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
