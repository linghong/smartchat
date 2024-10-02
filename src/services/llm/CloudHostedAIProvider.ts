import { BaseAIProvider, AIProvider } from './BaseAIProvider';
import { Message, AssistantOption, ImageFile } from '@/src/types/chat';

export class CloudHostedAIProvider
  extends BaseAIProvider
  implements AIProvider
{
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    super(apiKey);
    this.baseUrl = baseUrl;
  }

  async getChatCompletion(
    chatHistory: Message[],
    userMessage: string,
    fetchedText: string,
    selectedAssistant: AssistantOption,
    base64ImageSrc?: ImageFile[]
  ): Promise<string | undefined> {
    if (!this.apiKey) return undefined;

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

    const url = `${this.baseUrl}/api/chat_${model.category === 'hf-small' ? 'cpu' : 'gpu'}`;

    return this.retryOperation(
      async () => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.apiKey
          },
          body: JSON.stringify(data)
        });

        if (!res.ok) {
          throw new Error(`Network response was not ok: ${res.statusText}`);
        }

        return (await res.json()).message;
      },
      `Failed to fetch response from CloudHosted ${model.value} model`,
      4 // maxAttempts
    );
  }
}
