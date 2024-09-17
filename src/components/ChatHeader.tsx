import React from 'react';
import { Label } from '@/src/components/ui/label';
import CustomSelect from '@/src/components/CustomSelect';
import Modal from '@/src/components/Modal';
import { AssistantOption } from '@/src/types/chat';

interface ChatHeaderProps {
  chatTags: string[] | undefined;
  assistantOptions: AssistantOption[];
  selectedAssistant: AssistantOption;
  handleAssistantChange: (assistant: AssistantOption) => void;
  handleAddTags: (newTags: string[]) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatTags,
  assistantOptions,
  selectedAssistant,
  handleAssistantChange,
  handleAddTags
}) => {
  return (
    <div className="flex justify-between">
      <div className="flex py-2 space-x-2">
        {(!chatTags || chatTags.length === 0) && (
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
        {chatTags && chatTags.length > 0 && (
          <div className="px-4 py-2 bg-blue-100 text-gray-800">
            Tags: {chatTags.join(', ')}
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
