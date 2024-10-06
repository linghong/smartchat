import React from 'react';
import { useRouter } from 'next/router';

import { Label } from '@/src/components/ui/label';
import CustomSelect from '@/src/components/CustomSelect';
import Modal from '@/src/components/Modal';
import { useChatContext } from '@/src/context/ChatContext';
import { updateChat } from '@/src/utils/dataClient/sqliteChatIdApiClient';
import { AssistantOption } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

interface ChatHeaderProps {
  assistantOptions: AssistantOption[];
  selectedAssistant: AssistantOption;
  handleAssistantChange: (assistant: AssistantOption) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  assistantOptions,
  selectedAssistant,
  handleAssistantChange
}) => {
  const router = useRouter();

  const { activeChat, setActiveChat, chats, setChats } = useChatContext();

  const handleAddTags = (newTags: string[]) => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return [];
    }

    const chatTags = activeChat.tags || [];
    const updatedTags = [...new Set([...chatTags, ...newTags])];

    setActiveChat({ ...activeChat, tags: updatedTags });

    // Update the current chat in the chats state
    setChats((prevChats: OptionType[]) =>
      prevChats.map(chat =>
        chat.value === activeChat.value ? { ...chat, tags: updatedTags } : chat
      )
    );

    updateChat(token, activeChat.value, { tags: updatedTags });
    return updatedTags;
  };

  return (
    <div className="flex justify-between">
      <div className="flex py-2 space-x-2">
        {(!activeChat.tags || activeChat.tags.length === 0) && (
          <>
            <Label className="py-2 text-md">Assistant: </Label>
            <CustomSelect
              id="assistant"
              options={assistantOptions}
              value={selectedAssistant.value}
              onChange={(value: string) => {
                const newSelectedAssistant =
                  assistantOptions.find(option => option.value === value) ||
                  selectedAssistant;
                handleAssistantChange(newSelectedAssistant);
              }}
              placeholder="Select an assistant"
              selectedClass="w-full text-sm w-56"
            />
          </>
        )}
      </div>
      <div className="flex justify-end space-x-2 p-2">
        {activeChat.tags && activeChat.tags.length > 0 && (
          <div className="px-4 py-2 bg-blue-100 text-gray-800">
            Tags: {activeChat.tags?.join(', ') || ''}
          </div>
        )}
        <Modal
          onAddTags={handleAddTags}
          description="Enter new tag names, separated by commas. Click save when you're done."
          title="Add New Tags"
          label="Tags"
        />
      </div>
    </div>
  );
};

export default ChatHeader;
