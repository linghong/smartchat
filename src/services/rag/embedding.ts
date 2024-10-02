import { OpenAI } from 'openai';

import { OPENAI_API_KEY } from '@/config/env';

export const openaiClient = new OpenAI({
  apiKey: OPENAI_API_KEY
});

export const createEmbedding = async (text: string): Promise<number[]> => {
  const embedding = await openaiClient.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });

  return embedding.data[0].embedding;
};
