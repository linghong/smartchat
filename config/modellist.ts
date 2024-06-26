import { OptionType } from '@/src/types/common';

const modelOptions: OptionType[] = [
  {
    value: 'claude-3-5-sonnet-20240620',
    label: 'Claude 3.5 Sonnet',
    category: 'anthropic',
    contextWindow: 200000,
    vision: true
  },
  {
    value: 'claude-3-haiku-20240307',
    label: 'Claude 3 Haiku',
    category: 'anthropic',
    contextWindow: 200000,
    vision: true
  },
  {
    value: 'claude-3-opus-20240229',
    label: 'Claude 3 Opus',
    category: 'anthropic',
    contextWindow: 200000,
    vision: false
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    category: 'openai',
    contextWindow: 128000,
    vision: true
  },
  {
    value: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    category: 'openai',
    contextWindow: 128000,
    vision: true
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5',
    category: 'openai',
    contextWindow: 16385,
    vision: false
  },
  {
    value: 'gpt-4',
    label: 'GPT-4',
    category: 'openai',
    contextWindow: 8192,
    vision: false
  },
  {
    value: 'gemini-1.5-pro',
    label: 'Gemini-1.5 Pro',
    category: 'google',
    contextWindow: 128000,
    vision: true
  },
  {
    value: 'gemini-1.5-flash',
    label: 'Gemini-1.5 Flash',
    category: 'google',
    contextWindow: 128000,
    vision: true
  },
  {
    value: 'meta-llama/Llama-2-7b-chat-hf',
    label: 'Llama-2-7b-chat-hf',
    category: 'hf-large',
    contextWindow: 4000,
    vision: false
  },
  {
    value: 'microsoft/phi-1_5',
    label: 'phi-1_5',
    category: 'hf-small',
    contextWindow: 1000,
    vision: false
  },
  {
    value: 'llama3-8b-8192',
    label: 'LLaMA3 8b',
    category: 'groq',
    contextWindow: 8192,
    vision: false
  },
  {
    value: 'llama3-70b-8192',
    label: 'LLaMA3 70b',
    category: 'groq',
    contextWindow: 8192,
    vision: false
  },
  {
    value: 'mixtral-8x7b-32768',
    label: 'Mixtral 8x7b',
    category: 'groq',
    contextWindow: 32768,
    vision: false
  },
  {
    value: 'gemma-7b-it',
    label: 'Gemma 7b',
    category: 'groq',
    contextWindow: 8192,
    vision: false
  }
];

export { modelOptions };
