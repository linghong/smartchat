import React, { useRef, useEffect } from 'react';

import { Message, FileData } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import ChatMessage from './ChatMessage';
interface ChatMessageListProps {
  chatHistory: Message[];
  loading: boolean;
  fileSrcHistory: FileData[][];
  selectedModel: OptionType;
  handleModelChange: (newValue: OptionType) => void;
  modelOptions: OptionType[];
  handleFileDelete: (id: number) => void;
  handleRetry?: () => void;
  handleCopy: () => void;
}
const ChatMessageList: React.FC<ChatMessageListProps> = ({
  selectedModel,
  handleModelChange,
  modelOptions,
  chatHistory,
  loading,
  fileSrcHistory,
  handleFileDelete,
  handleRetry,
  handleCopy
}) => {
  const messagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatHistory]);
  const isNew = chatHistory[0].answer === 'Hi, how can I assist you?';
  return (
    <div className="flex-grow overflow-y-auto bg-white border-2 border-stone-200">
      <div
        className="w-full h-full rounded-lg"
        aria-live="polite"
        aria-atomic="true"
        ref={messagesRef}
      >
        {chatHistory.map((chat, index) => (
          <ChatMessage
            key={index}
            isNew={isNew && index === 0}
            message={chat}
            lastIndex={index === chatHistory.length - 1}
            loading={loading}
            fileSrc={fileSrcHistory[index]}
            selectedModel={selectedModel}
            handleModelChange={handleModelChange}
            modelOptions={modelOptions}
            handleFileDelete={handleFileDelete}
            handleCopy={handleCopy}
            handleRetry={
              index === chatHistory.length - 1 ? handleRetry : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};
export default ChatMessageList;
