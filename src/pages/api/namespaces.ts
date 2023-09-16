import { NextApiRequest, NextApiResponse } from 'next';
import { getNamespaces } from '@/src/services/pineconeClient'

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try { 
    if (! PINECONE_INDEX_NAME) throw new Error('Missing Pinecone index name')
    const namespaces = await getNamespaces(PINECONE_INDEX_NAME)

    res.status(200).json({namespaces});

  } catch (error) {
    console.log(error)
    res.status(500).json('An error occurred when fetching namespaces.');
  }
}