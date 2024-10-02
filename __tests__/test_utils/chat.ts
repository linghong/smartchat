import { AssistantOption, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

export const assistantGemini: AssistantOption = {
  isDefault: false,
  value: 'gemini1.5-pro-1',
  label: 'gemini1.5-pro 1',
  config: {
    name: 'gpt4-assistant-1',
    role: 'test',
    model: {
      value: 'gemini1.5-pro',
      label: 'Gemini 1.5 Pro',
      contextWindow: 128000,
      vision: true
    },
    basePrompt: 'Test base prompt',
    topP: 1,
    temperature: 0
  }
};

export const assistantOpenAI: AssistantOption = {
  isDefault: true,
  value: 'default-gpt-4',
  label: 'Default GPT-4',
  config: {
    name: 'gpt4-assistant',
    role: 'general',
    model: {
      value: 'gpt-4',
      label: 'GPT-4',
      contextWindow: 8192,
      vision: false
    },
    basePrompt: 'You are a helpful assistant',
    topP: 1,
    temperature: 0.7
  }
};

export const assistantClaude: AssistantOption = {
  isDefault: true,
  value: 'default-claude-3-5-sonnet',
  label: 'default claude 3.5 sonnet',
  config: {
    name: 'claude-3.5-sonnet',
    role: 'coding',
    model: {
      value: 'claude-3.5-sonnet',
      label: 'claude 3.5 sonnet',
      contextWindow: 128000,
      vision: true
    },
    basePrompt: 'You are a coding expert',
    topP: 1,
    temperature: 0
  }
};

export const assistantGroq: AssistantOption = {
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
    basePrompt: 'Write business report',
    topP: 0.5,
    temperature: 0.6
  }
};

export const assistantHFsm: AssistantOption = {
  value: 'huggingface-assistant-sm',
  label: 'Huggingface Small',
  isDefault: false,
  config: {
    name: 'Huggingface Small',
    role: 'router',
    model: {
      value: 'microsoft/phi-1_5',
      label: 'phi-1_5',
      category: 'hf-small',
      contextWindow: 1000,
      vision: false
    },
    basePrompt: 'You are a responsible AI assistant',
    topP: 0.5,
    temperature: 0.6
  }
};

export const assistantHFlg: AssistantOption = {
  value: 'huggingface-assistant-lg',
  label: 'Huggingface Large',
  isDefault: false,
  config: {
    name: 'Huggingface Large',
    role: 'writing',
    model: {
      value: 'meta-llama/Llama-2-7b-chat-hf',
      label: 'Llama-2-7b-chat-hf',
      category: 'hf-large',
      contextWindow: 4000,
      vision: false
    },
    basePrompt: 'Write a clear sentence',
    topP: 0.5,
    temperature: 0.6
  }
};

export const chats1: OptionType[] = [
  { value: '1', label: 'Chat 1', tags: ['tag1', 'tag2'] },
  { value: '2', label: 'Chat 2', tags: ['tag2'] },
  { value: '3', label: 'Chat 3', tags: ['tag3'] }
];

export const chats2: OptionType[] = [
  { value: '1', label: 'Chat 1', tags: ['tag1'] },
  { value: '2', label: 'Chat 2', tags: ['tag2'] }
];

export const mockImageFile: ImageFile = {
  base64Image: 'base64encodedimage',
  mimeType: 'image/jpeg',
  size: 1024,
  name: 'test.jpg'
};
