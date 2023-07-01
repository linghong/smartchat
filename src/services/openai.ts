import {Configuration,  OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiClinet = new OpenAIApi(configuration);

export const createEmbedding = async (text: string) => {
  const embedding = await openaiClinet.createEmbedding({
    model: "text-embedding-ada-002",
    input: text,
  });

  return embedding.data.data[0].embedding;
}






