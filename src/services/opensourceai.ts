import { Message } from '@/src/types/chat'
import { OptionType } from '@/src/types/common'

const getOpenModelChatCompletion = async (
  basePrompt: string, 
  chatHistory: Message[], 
  userMessage : string, 
  fetchedText: string, 
  selectedModel: OptionType, 
  serverURL: string
) : Promise<string | undefined> => {

  const serverSecretKey= process.env.NEXT_PUBLIC_SERVER_SECRET_KEY
  if(!serverSecretKey) {
    return 'Sever secret key is missing'
  }

  const data = {
    question: userMessage,
    basePrompt,
    chatHistory,      
    selectedModel: selectedModel.value,
    fetchedText
  }

  try {
    const res = await fetch(serverURL, {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + serverSecretKey
      },
      body: JSON.stringify(data)
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

export default getOpenModelChatCompletion