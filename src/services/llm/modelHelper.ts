import { Message, ImageFile } from '@/src/types/chat';

export interface MessageParam {
  role: 'user' | 'assistant';
  content: string | Array<TextBlockParam | ImageBlockParam>;
}

export interface ImageBlockParam {
  type: 'image';
  source: {
    type: 'base64';
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data: string;
  };
}

export interface TextBlockParam {
  type: 'text';
  text: string;
}

export const buildChatArray = (chatHistory: Message[]) => {
  const len = chatHistory.length;
  let chatArray: MessageParam[] = [];

  for (let i = 1; i < len; i++) {
    const chat = chatHistory[i];
    chatArray.push({
      role: 'user',
      content: chat.question
    });
    chatArray.push({
      role: 'assistant',
      content: chat.answer
    });
  }

  return chatArray;
};
