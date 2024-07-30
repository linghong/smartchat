import React, { useRef, useEffect } from 'react';

import { Message, ImageFile } from '@/src/types/chat';
import ChatMessage from './ChatMessage';

interface ChatMessageListProps {
  chatHistory: Message[];
  loading: boolean;
  imageSrcHistory: ImageFile[][];
  handleImageDelete: (id: number) => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  chatHistory,
  loading,
  imageSrcHistory,
  handleImageDelete
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
        className="w-full h-full overflow-y-auto rounded-lg"
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
            imageSrc={imageSrcHistory[index]} // Pass imageSrc here
            handleImageDelete={handleImageDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatMessageList;
