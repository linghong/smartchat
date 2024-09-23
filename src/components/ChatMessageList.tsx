import React, { useRef, useEffect, useCallback } from 'react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { fileSrcHistory, chatHistory } = useChatContext();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  // Add a resize observer to handle dynamic content
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } =
          scrollContainerRef.current;
        const isScrolledToBottom = scrollHeight - clientHeight <= scrollTop + 1;
        if (isScrolledToBottom) {
          scrollToBottom();
        }
      }
    });

    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [scrollToBottom]);

  const isNew = chatHistory[0].answer === initialMessage.answer;

  return (
    <div
      ref={scrollContainerRef}
      className="flex-grow overflow-y-auto bg-white border-2 border-stone-200"
      style={{ height: 'calc(100vh - 200px)', scrollBehavior: 'smooth' }}
    >
      <div className="w-full rounded-lg" aria-live="polite" aria-atomic="true">
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
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessageList;
