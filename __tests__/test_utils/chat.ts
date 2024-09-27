import { AssistantOption } from '@/src/types/chat';

export const assistant1: AssistantOption = {
  isDefault: false,
  value: 'gemini1.5-pro-1',
  label: 'gemini1.5-pro 1',
  config: {
    name: 'gpt4-assistant-1',
    role: 'test',
    model: {
      value: 'gemini-pro',
      label: 'Gemini Pro',
      contextWindow: 128000,
      vision: true
    },
    basePrompt: 'Test base prompt',
    topP: 1,
    temperature: 0
  }
};

export const assistant2: AssistantOption = {
  value: 'groq-assistant-1',
  label: 'Groq Assistant',
  isDefault: true,
  config: {
    name: 'groq-assistant-1',
    role: 'writing',
    model: {
      value: 'llama2-70b-4096',
      label: 'LLaMa 2 70B',
      contextWindow: 4096,
      vision: false
    },
    basePrompt: 'Hello, how can I help?',
    topP: 0.5,
    temperature: 0.6
  }
};
