import {Configuration,  OpenAIApi, ChatCompletionRequestMessageRoleEnum } from "openai"
import { Message } from '@/src/types/chat'

const chatResponseFromOpensource = async (chatHistory: Message[], userMessage : string, fetchedText: string, selectedModel: string) : Promise<string | undefined> => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
  const serverSecretKey= process.env.NEXT_PUBLIC_SERVER_SECRET_KEY
  if(!serverUrl) {
    return 'Url address for posting the data is missing'
  }
  if(!serverSecretKey) {
    return 'Sever secret key is missing'
  }

  const endpoint = 'chat/opensourcemodel'
  const url = `${serverUrl}/api/${endpoint}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + serverSecretKey
      },
      body: JSON.stringify({
        chatHistory,
        question: userMessage,
        selectedModel,
        fetchedText
      })
    })

    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.statusText}`);
    }

    return  (await res.json()).message

  } catch (error: any) {
    console.error(error)
    throw error
  }
}

export default chatResponseFromOpensource