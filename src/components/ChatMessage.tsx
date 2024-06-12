import Image from 'next/image'

import { Message, ImageFile } from '@/src/types/chat'
import ImageListWithModal from '@/src/components/ImageListWithModal'

type ChatMessageProps = {
  index: number;
  message: Message;
  lastIndex: boolean;
  loading: boolean;
  imageSrc: ImageFile[];
  modelName: string;
  handleImageDelete: (e:any) => void;
}

const ChatMessage: React.FC<ChatMessageProps>  = ({index, message, imageSrc, lastIndex, modelName,loading, handleImageDelete}) => {

  const convertNewlinesToBreaks = (text: string) => {
    return text.replace(/\n/g, '<br>')
  }

  return (
    <>
      {index !== 0 && 
        <article className="flex px-3 py-2 text-black" aria-label="user-message">
          <div className="w-16 flex flex-col justify-start items-center ai-answer" >
            <Image
              src="/user.png"
              alt="User avatar"
              width="30"
              height="30"
              className="h-8 w-8 mr-4 rounded-sm"
              priority
            />
          </div>
          <div className="w-11/12 user-question" >
            <div className="space-wrap" dangerouslySetInnerHTML={{ __html: convertNewlinesToBreaks(message.question)}} />
            { 
              <ImageListWithModal
                imageSrc={imageSrc}
                handleImageDelete={handleImageDelete}
              />
            }
          </div>         
        </article>}        
      {<article className="flex px-3 py-2 bg-slate-100 color-black ease-in duration-300" aria-labelledby="ai-response">
        <div className="w-16 flex flex-col justify-start items-center ai-answer" >
          <Image
            src="/bot.png"
            alt="AI bot avatar"
            width="30"
            height="30"
            className={`h-8 w-8 mr-4 rounded-sm ${loading && lastIndex &&'animate-pulse'}`}
            priority
          />
          <label className="text-xs">{modelName}</label>
        </div>
        <div className = " bot-response answer space-wrap" dangerouslySetInnerHTML={{ __html: convertNewlinesToBreaks(message.answer) }} />       
      </article>}
    </>
  )
}

export default ChatMessage