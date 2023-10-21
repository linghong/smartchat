import {Configuration,  OpenAIApi, ChatCompletionRequestMessageRoleEnum } from "openai"
import  { encode } from 'gpt-tokenizer'
import { Message } from '@/src/types/chat'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error('Missing OpenAI API key');

type ChatType = {
  role: ChatCompletionRequestMessageRoleEnum,
  content: string
}

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

const buildChatArray = (systemContent: string, userMessage : string, fetchedText: string, chatHistory: Message[], maxReturnMessageToken: number) => {
  // after comparing the token count received from OpenAI, it seems that counting tokens in the way shown below matches better with Open AI's token number.
  const tokenCount = (role: ChatCompletionRequestMessageRoleEnum, str: string) => {
    return encode(
    `role ${role} content ${str} `).length
  }
  const tokenUsed = tokenCount('system',
  systemContent) + tokenCount("assistant",
  fetchedText) + tokenCount("user",
  userMessage)
  let tokenLeft = 4000 - tokenUsed - maxReturnMessageToken

  let chatArray: ChatType[] = []

  let len = chatHistory.length
  tokenLeft -= tokenCount("user",
  chatHistory[len-1].question)  + tokenCount("assistant",
  chatHistory[len-1].answer)

  for (let i = chatHistory.length - 1; i >= 0 && tokenLeft > 0; i--) {
    const chat = chatHistory[i]
    chatArray.push({
      role: "assistant",
      content: chat.answer
    })
    chatArray.push( {
      role:"user",
      content: chat.question
    })
    tokenLeft -= tokenCount("user",
    chat.question) + tokenCount("assistant",
    chat.answer)
  }
  chatArray.reverse()

  return chatArray
}

export const getChatResponse = async (basePrompt: string, chatHistory: Message[],userMessage : string, fetchedText: string, selectedModel: string): Promise<string | undefined> => {
  const maxReturnMessageToken = 1500

  const htmlTagContent = selectedModel === 'gpt-4' ? 'When presenting information, please ensure to split your responses into paragraphs using <p> HTML tag. If you are providing a list, use the <ul> and <li> tags for unordered lists, <ol> and <li> tags for ordered lists. Highlight the important points using <strong> tag for bold text. Always remember to close any HTML tags that you open.' : ''

  const systemContent = "You are an AI assistant, skilled and equipped with a specialized data source as well as a vast reservoir of general knowledge. When a user presents a question, they can prompt you to extract relevant information from this data source. If information is obtained, it will be flagged with '''fetchedStart and closed with fetchedEnd'''. Only use the fetched data if it is directly relevant to the user's question and can contribute to a reasonable correct answer. Otherwise, rely on your pre-existing knowledge to provide the best possible response. Also, only give answer for the question asked, don't provide text not related to the user's question. " + htmlTagContent

  const chatArray = buildChatArray(systemContent, userMessage, fetchedText, chatHistory, maxReturnMessageToken)

  const userMessageWithFetchedData = fetchedText!=='' ? userMessage + '\n' + " '''fetchedStart " + fetchedText + " fetchedEnd'''"+ '\n'+ basePrompt : userMessage +'\n' + basePrompt

  try {
    const chatCompletion = await openaiClient.createChatCompletion({
        model: selectedModel,
        temperature: 0,
        max_tokens: maxReturnMessageToken,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 1,
        messages: [
          {role: "system", 
          content: systemContent
          }, 
          ...chatArray,
          { 
          role: "user", 
          content: userMessageWithFetchedData
        }],
    })

    const res = chatCompletion.data;
    if (!res) throw new Error('Chat completion data is undefined.')
    if (!res.usage) throw new Error('Chat completion data is undefined.')
    if(res.choices[0].finish_reason !== 'stop') console.log(`AI message isn't complete.`)
    let message = res.choices[0].message?.content?? ''
    message = selectedModel === 'gpt-4' ? message : message.replace(/\n/g, '<br>')

    return message

  } catch(error: any) {
    console.error(error.response.data)
    throw error
  }
}





