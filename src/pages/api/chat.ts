import type { NextApiRequest, NextApiResponse } from 'next'

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
  console.log(question, nameSpace, history)
}