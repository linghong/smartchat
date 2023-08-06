import {Configuration,  OpenAIApi } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error('Missing OpenAI API key');

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

export const openaiClient = new OpenAIApi(configuration);

export const createEmbedding = async (text: string): Promise<number[]> => {
  const embedding = await openaiClient.createEmbedding({
    model: "text-embedding-ada-002",
    input: text,
  });

  return embedding.data.data[0].embedding;
}

export const getChatResponse = async (userMessage : string, selectedModel: string): Promise<string | undefined> => {
  try {
    const chatCompletion = await openaiClient.createChatCompletion({
        model: selectedModel,
        temperature: 0.5,
        max_tokens: 2048,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 1,
        messages: [
          {role: "system", 
          content: "You are an AI assistant and an expert. You have access to specific knowledge provided in this conversation, fetched from a saved data source, and also have a broad base of pre-existing knowledge. Use the information fetched from the data source only if it's directly relevant to the user's question. If the information is not relevant, rely on your pre-existing knowledge to provide the best possible answer. When presenting information, split your responses into paragraphs, using relevant HTML tags: <p> for paragraphs, <ul> and <li> for unordered lists, <ol> and <li> for ordered lists, and <strong> for bold text, and always ensure the use of proper closing tags for any HTML elements opened."
          }, { 
          role: "user", 
          content: userMessage
        }],
    });
    const res = chatCompletion.data;
    if (!res) throw new Error('Chat completion data is undefined.')
    if (!res.usage) throw new Error('Chat completion data is undefined.')
    if(res.choices[0].finish_reason !== 'stop') console.log('AI message isn\'t complete.')
    const message = res.choices[0].message?.content?? ''
    const totalTokens = res.usage.total_tokens
    return message

  } catch(error: any) {
    console.error(error.response.data)
    throw error
  }
}





