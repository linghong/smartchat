import React from 'react';
import Image from 'next/image';
import { RefreshCw, Copy, Wand2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import AITextMessage from '@/src/components/AITextMessage';
import CustomSelect from '@/src/components/CustomSelect';
import FileListWithModal from '@/src/components/FileListWithModal';
import { Message, FileData, AssistantOption } from '@/src/types/chat';
import { encodeHTMLEntities } from '@/src/utils/guardrail';

type ChatMessageProps = {
  isNew: boolean;
  message: Message;
  lastIndex: boolean;
  loading: boolean;
  fileSrc: FileData[];
  selectedAssistant: AssistantOption;
  handleAssistantChange: (newValue: AssistantOption) => void;
  assistantOptions: AssistantOption[];
  handleFileDelete: (e: any) => void;
  handleRetry?: () => void;
  handleCopy: () => void;
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  isNew,
  message,
  fileSrc,
  lastIndex,
  loading,
  selectedAssistant,
  handleAssistantChange,
  assistantOptions,
  handleFileDelete,
  handleRetry,
  handleCopy
}) => {
  return (
    <>
      {!isNew && (
        <article
          className="flex px-3 py-2 text-black"
          aria-label="user-message"
        >
          <div className="w-16 px-2 flex flex-col justify-start items-center user">
            <Image
              src="/user.png"
              alt="User avatar"
              width="30"
              height="30"
              className="h-8 w-8 mr-4 rounded-sm"
              priority
            />
          </div>
          <div className="flex-1 user-question">
            <div
              className="user-question space-wrap"
              dangerouslySetInnerHTML={{
                __html: encodeHTMLEntities(message.question)
              }}
            />
            {
              <FileListWithModal
                fileSrc={fileSrc}
                handleFileDelete={handleFileDelete}
              />
            }
          </div>
        </article>
      )}
      <article
        className="flex px-3 py-2 bg-slate-100 text-black ease-in duration-300"
        aria-labelledby="ai-response"
      >
        <div className="w-16 px-2 flex flex-col justify-start items-center ai">
          <Image
            src="/bot.png"
            alt="AI avatar"
            width="30"
            height="30"
            className={`h-8 w-8 mr-4 rounded-sm ${loading && lastIndex && 'animate-pulse'}`}
            priority
          />
          <label className="text-xs">{message.assistant}</label>
        </div>

        <div className="flex-1 ai-answer space-wrap">
          {<AITextMessage content={message.answer} />}

          {!isNew && lastIndex && (
            <div className="flex justify-between items-center mt-2">
              <div className="flex space-x-2">
                {handleRetry && (
                  <Button
                    onClick={handleRetry}
                    className="flex items-center p-1 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    aria-label="Retry AI response"
                    variant="ghost"
                  >
                    <RefreshCw className="w-5 h-5 mr-1" />
                    <span>Retry</span>
                  </Button>
                )}
                {handleCopy && message.answer !== '' && (
                  <Button
                    onClick={handleCopy}
                    className="flex items-center p-1 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    aria-label="Copy AI response"
                    variant="ghost"
                  >
                    <Copy className="w-5 h-5 mr-1" />
                    <span>Copy</span>
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  className="flex items-center p-1 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  aria-label="Change Assistant"
                  variant="ghost"
                >
                  <Wand2 className="w-5 h-5 mr-1" />
                </Button>
                <div className="w-80">
                  <CustomSelect
                    id="assistant"
                    options={assistantOptions}
                    value={selectedAssistant.value}
                    onChange={(value: string) => {
                      const newSelectedAssistant =
                        assistantOptions.find(
                          option => option.value === value
                        ) || selectedAssistant;
                      handleAssistantChange(newSelectedAssistant);
                    }}
                    placeholder="Select an assistant"
                    selectedClass="w-full text-sm" // Add any additional classes for styling
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
};
export default ChatMessage;
