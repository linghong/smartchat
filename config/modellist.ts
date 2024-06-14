import { OptionType } from '@/src/types/common'

const modelOptions: OptionType[] = [
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    category: 'openai',
    contextWindow: 128000,
  },
  {
    value: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    category: 'openai',
    contextWindow: 128000,
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5',
    category: 'openai',
    contextWindow: 16385,
  },
  { value: 'gpt-4', label: 'GPT-4', category: 'openai', contextWindow: 8192 },
  {
    value: 'gemini-1.5-pro',
    label: 'Gemini-1.5 Pro',
    category: 'google',
    contextWindow: 128000,
  },
  {
    value: 'gemini-1.5-flash',
    label: 'Gemini-1.5 Flash',
    category: 'google',
    contextWindow: 128000,
  },
  {
    value: 'meta-llama/Llama-2-7b-chat-hf',
    label: 'Llama-2-7b-chat-hf',
    category: 'hf-large',
    contextWindow: 4000,
  },
  {
    value: 'microsoft/phi-1_5',
    label: 'phi-1_5',
    category: 'hf-small',
    contextWindow: 1000,
  },
  {
    value: 'llama3-8b-8192',
    label: 'LLaMA3 8b',
    category: 'groq',
    contextWindow: 8192,
  },
  {
    value: 'llama3-70b-8192',
    label: 'LLaMA3 70b',
    category: 'groq',
    contextWindow: 8192,
  },
  {
    value: 'mixtral-8x7b-32768',
    label: 'Mixtral 8x7b',
    category: 'groq',
    contextWindow: 32768,
  },
  {
    value: 'gemma-7b-it',
    label: 'Gemma 7b',
    category: 'groq',
    contextWindow: 8192,
  },
]

export { modelOptions }
