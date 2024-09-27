import { NEXT_PUBLIC_SERVER_SECRET_KEY } from '@/config/env';
import { Message, AssistantOption } from '@/src/types/chat';

const getOpenModelChatCompletion = async (
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedAssistant: AssistantOption,
  serverURL: string
): Promise<string | undefined> => {
  if (!NEXT_PUBLIC_SERVER_SECRET_KEY) return undefined;
  const { model, basePrompt, temperature, topP } = selectedAssistant.config;

  const data = {
    question: userMessage,
    basePrompt: basePrompt,
    chatHistory,
    selectedModel: model.value,
    fetchedText,
    temperature,
    topP
  };

  try {
    const res = await fetch(serverURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + NEXT_PUBLIC_SERVER_SECRET_KEY
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.statusText}`);
    }

    return (await res.json()).message;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export default getOpenModelChatCompletion;
