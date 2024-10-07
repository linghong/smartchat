import 'groq-sdk/shims/node';
import { Groq } from 'groq-sdk';
import { Message, AssistantOption } from '@/src/types/chat';
import { BaseAIProvider } from '@/src/services/llm/BaseAIProvider';

export class GroqProvider extends BaseAIProvider {
  private groq: Groq;

  constructor(apiKey: string) {
    super(apiKey);
    this.groq = new Groq({ apiKey });
  }

  private buildSystemContent(fetchedText: string, model: string): string {
    const systemBase =
      'You are a responsible and knowledgeable AI assistant. You have access to a vast amount of general knowledge.';

    const systemRAG =
      fetchedText.length !== 0
        ? `
      ## Handling Information Retrieval (RAG):
      In addition, for some user questions, the system may provide AI with text retrieved from a specialized data source using RAG (Retrieval Augmented Generation). This retrieved text will be enclosed between the tag pair "'''fetchedStart" and "fetchedEnd'''". This tag pair is for AI to know the source of the text. AI assistant is not supposed to disclose the tag pair in the message.

      Only use the fetched data if it is directly relevant to the user's question and can contribute to a reasonable correct answer. Otherwise, rely on your pre-existing knowledge to provide the best possible response.
      `
        : '';

    const systemStrategery = 'For difficult problems, solve it step-by-step.';

    const systemSubjectTitle =
      model !== 'llama-3.2-1b-preview'
        ? `
      ## Formatting:
      For every message you send to users, no matter how simple, you must include a very concise subject title at the END of your response. This title should come after all other content in your message. Enclose the title within triple curly braces like this: {{{Subject Title Goes Here}}}. This placement at the end is absolutely critical.
      `
        : '';

    return systemBase + systemRAG + systemStrategery + systemSubjectTitle;
  }
  private buildChatArray(chatHistory: Message[]): any[] {
    return chatHistory.flatMap(message => [
      { role: 'user', content: message.question },
      { role: 'assistant', content: message.answer }
    ]);
  }

  public async getChatCompletion(
    chatHistory: Message[],
    userMessage: string,
    fetchedText: string,
    selectedAssistant: AssistantOption
  ): Promise<string | undefined> {
    const { model, basePrompt, temperature, topP } = selectedAssistant.config;
    const maxReturnMessageToken = 4000;

    const systemContent = this.buildSystemContent(fetchedText, model.value);
    const userMessageWithFetchedData = this.formatUserMessage(
      userMessage,
      fetchedText,
      basePrompt
    );

    const messages = [
      { role: 'system', content: systemContent },
      ...this.buildChatArray(chatHistory),
      { role: 'user', content: userMessageWithFetchedData }
    ];

    return this.retryOperation(
      async () => {
        try {
          const completion = await this.groq.chat.completions.create({
            messages,
            model: model.value,
            temperature: temperature,
            max_tokens: maxReturnMessageToken,
            frequency_penalty: 0,
            presence_penalty: 0,
            top_p: topP
          });

          if (
            !completion ||
            !completion.choices ||
            !completion.choices.length
          ) {
            throw new Error('No completion choices returned from the server.');
          }

          return completion.choices[0]?.message?.content || '';
        } catch (error) {
          return this.handleError(error, 'Groq');
        }
      },
      'Failed to fetch response from Groq model',
      2 // maxAttempt = 2
    );
  }
}
