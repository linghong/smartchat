import { NEXT_PUBLIC_SERVER_SECRET_KEY } from '@/config/env'
import { Message } from '@/src/types/chat'
import { OptionType } from '@/src/types/common'

const getOpenModelChatCompletion = async (
  basePrompt: string,
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedModel: OptionType,
  serverURL: string,
): Promise<string | undefined> => {
  if (!NEXT_PUBLIC_SERVER_SECRET_KEY) return undefined

  const data = {
    question: userMessage,
    basePrompt,
    chatHistory,
    selectedModel: selectedModel.value,
    fetchedText,
  }

  try {
    const res = await fetch(serverURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + NEXT_PUBLIC_SERVER_SECRET_KEY,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.statusText}`)
    }

    return (await res.json()).message
  } catch (error: any) {
    console.error(error)
    throw error
  }
}

export default getOpenModelChatCompletion
