// TestAIProvider.ts
import { BaseAIProvider } from '@/src/services/llm/BaseAIProvider';
import { Message, ImageFile, AssistantOption } from '@/src/types/chat';

export class MockAIProvider extends BaseAIProvider {
  constructor(apiKey: string) {
    super(apiKey);
  }

  async getChatCompletion(
    chatHistory: Message[],
    userMessage: string,
    fetchedText: string,
    selectedAssistant: AssistantOption,
    base64ImageSrc?: ImageFile[]
  ): Promise<string | undefined> {
    // Mock implementation for testing purposes
    return 'Test completion';
  }
}
