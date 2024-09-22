import React, { useRef, useEffect } from 'react';

import ChatMessage from '@/src/components/ChatMessage';
import { useChatContext } from '@/src/context/ChatContext';
import { AssistantOption } from '@/src/types/chat';
import { initialMessage } from '@/src/utils/initialData';

export interface ChatMessageListProps {
  loading: boolean;
  assistantOptions: AssistantOption[];
  selectedAssistant: AssistantOption;
  handleAssistantChange: (newValue: AssistantOption) => void;
  handleFileDelete: (id: number) => void;
  handleRetry?: () => void;
  handleCopy: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  assistantOptions,
  selectedAssistant,
  handleAssistantChange,
  loading,
  handleFileDelete,
  handleRetry,
  handleCopy
}) => {
  const messagesRef = useRef<HTMLDivElement>(null);

  const { fileSrcHistory, chatHistory } = useChatContext();

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
