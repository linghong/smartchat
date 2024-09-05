import Image from 'next/image';
import { RefreshCw, Copy, Wand2 } from 'lucide-react';

import { Button } from '@/src/components/ui/button';

import AITextMessage, {
  sanitizeAndFormate
} from '@/src/components/AITextMessage';
import CustomSelect from '@/src/components/CustomSelect';
import FileListWithModal from '@/src/components/FileListWithModal';
import { Message, FileData } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { encodeHTMLEntities } from '@/src/utils/htmlEntities';

type ChatMessageProps = {
  isNew: boolean;
  message: Message;
  lastIndex: boolean;
  loading: boolean;
  fileSrc: FileData[];
  selectedModel: OptionType;
  handleModelChange: (newValue: OptionType) => void;
  modelOptions: OptionType[];
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
  selectedModel,
  handleModelChange,
  modelOptions,
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
                __html: sanitizeAndFormate(encodeHTMLEntities(message.question))
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
          <label className="text-xs">{message.model}</label>
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

              <Button
                className="flex items-center p-1 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                aria-label="Change Model"
                variant="ghost"
              >
                <Wand2 className="w-5 h-5 mr-1" />
                <CustomSelect
                  id="model"
                  options={modelOptions}
                  value={selectedModel.value}
                  onChange={value => {
                    const newSelectedModel = modelOptions.find(
                      option => option.value === value
                    );
                    if (newSelectedModel) {
                      handleModelChange(newSelectedModel);
                    }
                  }}
                  placeholder="Select a model"
                />
              </Button>
            </div>
          )}
        </div>
      </article>
    </>
  );
};
export default ChatMessage;
