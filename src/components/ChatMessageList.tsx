import React, {
  useRef,
  useEffect,
  useState,
  Dispatch,
  SetStateAction
} from 'react';

import ChatMessage from '@/src/components/ChatMessage';
import { getAIConfigs } from '@/src/utils/sqliteAIConfigApiClient';
import { Message, FileData, AssistantOption } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { initialMessage } from '@/src/utils/initialData';

interface ChatMessageListProps {
  chatHistory: Message[];
  loading: boolean;
  fileSrcHistory: FileData[][];
  assistantOptions: AssistantOption[];
  setAssistantOptions: Dispatch<SetStateAction<AssistantOption[]>>;
  selectedAssistant: AssistantOption;
  handleAssistantChange: (newValue: AssistantOption) => void;
  modelOptions: OptionType[];
  handleFileDelete: (id: number) => void;
  handleRetry?: () => void;
  handleCopy: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  assistantOptions,
  setAssistantOptions,
  selectedAssistant,
  handleAssistantChange,
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

  const isNew = chatHistory[0].answer === initialMessage.answer;

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
            selectedAssistant={selectedAssistant}
            handleAssistantChange={handleAssistantChange}
            assistantOptions={assistantOptions}
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
