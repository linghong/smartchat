import { OptionType } from '@/src/types/common';
export interface Chat {
  id: number;
  title: string;
}

export type ChatRole = 'system' | 'assistant' | 'user';

export type ChatType = {
  role: ChatRole;
  content: string;
};

export interface ImageFile {
  base64Image: string;
  mimeType: string;
  size: number;
  name: string;
  width?: number;
  height?: number;
}

export interface FileData {
  base64Content: string;
  type: string;
  size: number;
  name: string;
  width?: number;
  height?: number;
}

export interface Message {
  question: string;
  answer: string;
  assistant: string;
}

export interface textGenerationConfig {
  temperature: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  top_p: number;
}

export interface AIConfig {
  id?: string;
  name: string;
  role: string;
  model: OptionType;
  basePrompt: string;
  temperature: number;
  topP: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface AssistantOption extends OptionType {
  isDefault: boolean;
  config: AIConfig;
}

export interface OpenAIChatContentImage {
  type: 'image_url';
  image_url: {
    url: string;
    detail: 'auto' | 'low' | 'high';
  };
}
export interface OpenAIChatContentText {
  type: 'text';
  text: string;
}
