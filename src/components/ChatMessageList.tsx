import React, { useRef, useEffect } from 'react';

import { Message, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import ChatMessage from './ChatMessage';

interface ChatMessageListProps {
  chatHistory: Message[];
  loading: boolean;
  imageSrcHistory: ImageFile[][];
  selectedModel: OptionType | null;
  handleImageDelete: (id: number) => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  chatHistory,
  loading,
  imageSrcHistory,
  selectedModel,
  handleImageDelete
}) => {
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="flex-grow overflow-y-auto bg-white border-2 border-stone-200">
      <div
        className="w-full h-full overflow-y-auto rounded-lg"
        aria-live="polite"
        aria-atomic="true"
        ref={messagesRef}
      >
        {chatHistory.map((chat, index) => (
          <ChatMessage
            key={index}
            index={index}
            message={chat}
            lastIndex={index === chatHistory.length - 1}
            loading={loading}
            imageSrc={imageSrcHistory[index]} // Pass imageSrc here
            modelName={selectedModel?.label || 'GPT-4o'}
            handleImageDelete={handleImageDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatMessageList;
