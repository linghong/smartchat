import React from 'react';

import { render } from '@testing-library/react';
import { defaultModel } from '@/src/utils/initialData';
import { ChatContext, ChatContextType } from '@/src/context/ChatContext';

export const defaultChatHistory = [
  {
    question: 'Hello',
    answer: 'How can I assistant you?',
    assistant: 'GPT-4 assistant'
  },
  {
    question: 'How are you?',
    answer: "I'm doing well, thank you!",
    assistant: 'GPT-4 assistant'
  }
];

export const defaultContextValue: ChatContextType = {
  isNewChat: false,
  setIsNewChat: jest.fn(),
  isConfigPanelVisible: false,
  setIsConfigPanelVisible: jest.fn(),
  isSearchChat: false,
  setIsSearchChat: jest.fn(),
  fileSrcHistory: [[], []],
  setFileSrcHistory: jest.fn(),
  chatHistory: defaultChatHistory,
  setChatHistory: jest.fn(),
  chatId: '0',
  setChatId: jest.fn(),
  chats: [],
  setChats: jest.fn(),
  selectedModel: defaultModel,
  setSelectedModel: jest.fn()
};

export const renderWithContext = (
  ui: React.ReactElement,
  contextValue: Partial<ChatContextType> = {}
) => {
  return render(
    <ChatContext.Provider value={{ ...defaultContextValue, ...contextValue }}>
      {ui}
    </ChatContext.Provider>
  );
};
