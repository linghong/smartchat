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

export interface Message {
  question: string;
  answer: string;
  model: string;
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
