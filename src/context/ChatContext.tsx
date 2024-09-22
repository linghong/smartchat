'use client';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction
} from 'react';

import { Message, FileData } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { initialMessage, defaultModel } from '@/src/utils/initialData';

export interface ChatContextType {
  isNewChat: boolean;
  setIsNewChat: Dispatch<SetStateAction<boolean>>;
  isConfigPanelVisible: boolean;
  setIsConfigPanelVisible: Dispatch<SetStateAction<boolean>>;
  isSearchChat: boolean;
  setIsSearchChat: Dispatch<SetStateAction<boolean>>;
  fileSrcHistory: FileData[][];
  setFileSrcHistory: Dispatch<SetStateAction<FileData[][]>>;
  chatHistory: Message[];
  setChatHistory: Dispatch<SetStateAction<Message[]>>;
  chatId: string;
  setChatId: Dispatch<SetStateAction<string>>;
  chats: OptionType[];
  setChats: Dispatch<SetStateAction<OptionType[]>>;
  selectedModel: OptionType;
  setSelectedModel: Dispatch<SetStateAction<OptionType>>;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [isNewChat, setIsNewChat] = useState(true);
  const [isConfigPanelVisible, setIsConfigPanelVisible] = useState(true);
  const [isSearchChat, setIsSearchChat] = useState(false);
  const [fileSrcHistory, setFileSrcHistory] = useState<FileData[][]>([[]]);
  const [chatHistory, setChatHistory] = useState<Message[]>([initialMessage]);
  const [chatId, setChatId] = useState<string>('0');
  const [chats, setChats] = useState<OptionType[]>([]);
  const [selectedModel, setSelectedModel] = useState<OptionType>(defaultModel);

  return (
    <ChatContext.Provider
      value={{
        isNewChat,
        setIsNewChat,
        isConfigPanelVisible,
        setIsConfigPanelVisible,
        isSearchChat,
        setIsSearchChat,
        fileSrcHistory,
        setFileSrcHistory,
        chatHistory,
        setChatHistory,
        chatId,
        setChatId,
        chats,
        setChats,
        selectedModel,
        setSelectedModel
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
