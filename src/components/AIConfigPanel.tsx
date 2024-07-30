import React, { FC } from 'react';
import { ActionMeta, SingleValue } from 'react-select';
import DropdownSelect from '@/src/components/DropdownSelect';
import { OptionType } from '@/src/types/common';

interface AIConfigPanelProps {
  selectedModel: OptionType;
  handleModelChange: (
    selectedOption: SingleValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => void;
  selectedNamespace: OptionType | null;
  handleNamespaceChange: (selectedOption: OptionType | null) => void;
  basePrompt: string;
  handleBasePromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  modelOptions: OptionType[];
  fileCategoryOptions: OptionType[];
}

const AIConfigPanel: FC<AIConfigPanelProps> = ({
  selectedModel,
  handleModelChange,
  selectedNamespace,
  handleNamespaceChange,
  basePrompt,
  handleBasePromptChange,
  modelOptions,
  fileCategoryOptions
}) => {
  const initialFileCategory: OptionType = { value: 'none', label: 'None' };

  return (
    <div
      className={`
    transition-[max-height] duration-500 ease-in-out
    }
  `}
    >
      <div className="flex flex-col w-full bg-gray-50 border-2 border-indigo-100 p-4 shadow-lg shadow-slate-200">
        <div className="flex font-bold text-xl justify-center">
          Config My AI Assistant
        </div>
        <div className="flex flex-col lg:flex-row w-full justify-between">
          <DropdownSelect
            selectedOption={selectedModel}
            onChange={handleModelChange}
            options={modelOptions}
            label="Choose AI Model:"
          />
          <DropdownSelect
            selectedOption={selectedNamespace}
            onChange={handleNamespaceChange}
            options={[initialFileCategory, ...fileCategoryOptions]}
            label="Select RAG File:"
          />
        </div>
        <div className="flex flex-col w-full items-center py-2">
          <label htmlFor="userSystemPrompt" className="text-base font-bold">
            Enter text here for AI to remember throughout the chat:
          </label>
          <textarea
            id="userSystemPrompt"
            rows={3}
            name="userSystemPrompt"
            onChange={handleBasePromptChange}
            value={basePrompt}
            className="w-full placeholder-gray-400 my-2 p-2 border-2 border-stone-300 rounded focus:ring-stone-100 focus:outline-none hover:bg-stone-50"
            aria-label="Enter text here for AI to remember throughout the chat"
          />
        </div>
      </div>
    </div>
  );
};

export default AIConfigPanel;
