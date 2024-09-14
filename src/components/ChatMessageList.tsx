import React, { useRef, useEffect, useState } from 'react';

import ChatMessage from '@/src/components/ChatMessage';
import { getAIConfigs } from '@/src/utils/sqliteAIConfigApiClient';
import { Message, FileData, AssistantOption } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { defaultAssistants } from '@/src/utils/initialData';

interface ChatMessageListProps {
  chatHistory: Message[];
  loading: boolean;
  fileSrcHistory: FileData[][];
  selectedAssistant: AssistantOption;
  handleAssistantChange: (newValue: AssistantOption) => void;
  modelOptions: OptionType[];
  handleFileDelete: (id: number) => void;
  handleRetry?: () => void;
  handleCopy: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
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
  const [assistantOptions, setAssistantOptions] =
    useState<AssistantOption[]>(defaultAssistants);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    const fetchAssistants = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const fetchedAssistants = await getAIConfigs(token);

        const customAssistants: AssistantOption[] = fetchedAssistants.map(
          assistant => ({
            value: assistant.id
              ? assistant.id.toString()
              : `custom-${assistant.name}`,
            label: assistant.name,
            isDefault: false,
            config: assistant
          })
        );

        const newAssistantOptions = [...defaultAssistants, ...customAssistants];
        setAssistantOptions(newAssistantOptions);

        // Set an initial selected assistant if none is selected
        if (!selectedAssistant && newAssistantOptions.length > 0) {
          handleAssistantChange(newAssistantOptions[0]);
        }
      }
    };

    fetchAssistants();
  }, [modelOptions, selectedAssistant, handleAssistantChange]);

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
