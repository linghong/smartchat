import { OptionType } from '@/src/types/common';

const modelOptions: OptionType[] = [
  {
    value: 'gemini-1.5-pro-exp-0827',
    label: 'Gemini-1.5 Pro Exp',
    category: 'google',
    contextWindow: 2097512,
    vision: true
  },
  {
    value: 'gemini-1.5-flash-exp-0827',
    label: 'Gemini-1.5 Flash Exp',
    category: 'google',
    contextWindow: 1048576,
    vision: true
  },
  {
    value: 'gemini-1.5-flash-8b-exp-0924',
    label: 'Gemini-1.5 Flash-8b Exp',
    category: 'google',
    contextWindow: 1048576,
    vision: true
  },
  {
    value: 'gemini-1.5-pro-002',
    label: 'Gemini-1.5 Pro',
    category: 'google',
    contextWindow: 2097512,
    vision: true
  },
  {
    value: 'gemini-1.5-flash-002',
    label: 'Gemini-1.5 Flash',
    category: 'google',
    contextWindow: 1048576,
    vision: true
  },
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
    value: 'gpt-4o-2024-08-06',
    label: 'GPT-4o-2024-08-06',
    category: 'openai',
    contextWindow: 128000,
    vision: true
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    category: 'openai',
    contextWindow: 128000,
    vision: true
  },
  {
    value: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
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
    value: 'gpt-4',
    label: 'GPT-4',
    category: 'openai',
    contextWindow: 8192,
    vision: false
  },
  /*{
    value: 'llama-3.2-11b-vision-preview',
    label: 'Llama3.2 11b vision',
    category: 'groq',
    contextWindow: 8000, //contextwindow: 128000, but limited to 8k by groq
    vision: true
  },*/
  {
    value: 'llama-3.2-90b-text-preview',
    label: 'Llama3.2 90b',
    category: 'groq',
    contextWindow: 8000, //contextwindow: 128000, but limited to 8k by groq
    vision: false
  },
  {
    value: 'llama-3.2-3b-preview',
    label: 'Llama3.2 3b',
    category: 'groq',
    contextWindow: 8000, //contextwindow: 128000, but limited to 8k by groq
    vision: false
  },
  {
    value: 'llama-3.2-1b-preview',
    label: 'Llama3.2 1b',
    category: 'groq',
    contextWindow: 8000, //contextwindow: 128000, but limited to 8k by groq
    vision: false
  },
  {
    value: 'llama-3.1-70b-versatile',
    label: 'Llama3.1 70b',
    category: 'groq',
    contextWindow: 8000, //contextWindow: 131072, but limited to 8k by groq
    vision: false
  },
  {
    value: 'llama-3.1-8b-instant',
    label: 'Llama3.1 8b',
    category: 'groq',
    contextWindow: 8000, //contextWindow: 131072, but limited to 8k by groq
    vision: false
  },
  {
    value: 'llama3-70b-8192',
    label: 'Llama3 70b',
    category: 'groq',
    contextWindow: 8192,
    vision: false
  },
  {
    value: 'llama3-8b-8192',
    label: 'Llama3 8b',
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
  },
  {
    value: 'gemma2-9b-it',
    label: 'Gemma2 9b',
    category: 'groq',
    contextWindow: 8192,
    vision: false
  },
  /*{
    value: 'llava-v1.5-7b-4096-preview',
    label: 'LLaVA 1.5 7b',
    category: 'groq',
    contextWindow: 4096,
    vision: true
  },*/
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
  }
];

export { modelOptions };
