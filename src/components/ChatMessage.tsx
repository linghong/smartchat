import Image from 'next/image';

import AITextMessage, {
  sanitizeAndFormate
} from '@/src/components/AITextMessage';
import FileListWithModal from '@/src/components/FileListWithModal';
import { Message, FileData } from '@/src/types/chat';
import { encodeHTMLEntities } from '@/src/utils/htmlEntities';

type ChatMessageProps = {
  isNew: boolean;
  message: Message;
  lastIndex: boolean;
  loading: boolean;
  fileSrc: FileData[];
  handleFileDelete: (e: any) => void;
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  isNew,
  message,
  fileSrc,
  lastIndex,
  loading,
  handleFileDelete
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
              className="user-question styledComponent space-wrap"
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
        <div className="flex-1 styledContent ai-answer space-wrap">
          {<AITextMessage content={message.answer} />}
        </div>
      </article>
    </>
  );
};

export default ChatMessage;
