import Image from 'next/image'
import { Message } from '@/src/types/chat'
import ImageListWithModal from '@/src/components/ImageListWithModal'

type ChatMessageProps = {
  message: Message;
  lastIndex: boolean;
  loading: boolean;
  imageSrc: string[];
  handleImageDelete: (e:any) => void;
}

const ChatMessage: React.FC<ChatMessageProps>  = ({message, imageSrc, lastIndex, loading, handleImageDelete}) => {

  const convertNewlinesToBreaks = (text: string) => {
    return text.replace(/\n/g, '<br>')
  }

  return (
    <>
      {message?.question?.length !== 0 && 
        <article className="flex px-3 py-2 text-black" aria-label="user-message">
          <Image
            src="/user.png"
            alt="User avatar"
            width="30"
            height="30"
            className="h-full mr-4 rounded-sm"
            priority
          />
          <div className="user-question" >
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
        <Image
          src="/bot.png"
          alt="AI bot avatar"
          width="30"
          height="30"
          className={`h-full mr-4 rounded-sm ${loading && lastIndex &&'animate-pulse'}`}
          priority
        />
        <div className = "bot-response answer space-wrap" dangerouslySetInnerHTML={{ __html: convertNewlinesToBreaks(message.answer) }} />       
      </article>}
    </>
  )
}

export default ChatMessage