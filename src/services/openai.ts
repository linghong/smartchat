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

export const getChatResponse = async (userMessage : string) => {
  try {
    const chatCompletion = await openaiClinet.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0,
        max_tokens: 2048,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 1,
        messages: [
          {role: "system", 
          content: "You are an AI assistant and an expert. You should use both the information provided by the user and your pre-existing knowledge to answer the questions."
          }, { 
          role: "user", 
          content: userMessage
        }],
    });
    const message = chatCompletion.data.choices[0].message
    return message
  } catch(error: any) {
    console.log(error.response.data)
  }
}





