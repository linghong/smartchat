import Image from 'next/image'
import { Message } from '@/src/types/chat'

type ChatMessageProps = {
  message: Message
  lastIndex: boolean, 
  loading: boolean
}

const ChatMessage: React.FC<ChatMessageProps>  = ({message, lastIndex, loading}) => {

  return (
    <>
      {message?.question?.length !== 0 && 
        <div 
          className="flex p-3 text-black"
        >
          <Image
            src="/user.png"
            alt="User"
            width="30"
            height="30"
            className="h-full mr-4 rounded-sm"
            priority
          />
          <p>{message.question}</p>
        </div>}
      {<div 
        className="flex p-3 bg-slate-100 color-black ease-in duration-300"
      >
        <Image
          src="/bot.png"
          alt="AI Bot"
          width="30"
          height="30"
          className={`h-full mr-4 rounded-sm ${loading && lastIndex &&'animate-pulse'}`}
          priority
        />
        <div className ="bot-responses" dangerouslySetInnerHTML={{ __html: message.answer }} />       
      </div>}
    </>
  )
}

export default ChatMessage