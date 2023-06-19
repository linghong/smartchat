import {useState, useRef } from 'react'
import ArrowButton  from '@/src/components/ArrowButton'
import ChatMessage from '@/src/components/ChatMessage'
import { Message } from '@/src/types/chat'

const HomePage = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const [userInput, setUserInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  /*const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      question: '', 
      answer:'Hi, How can I assist you?'
    }])*/

  const handleSubmit = () => {

  }

  const chatHistory = [ {
    question: '', 
    answer:'Hi, How can I assist you?'
  }, {
    question: 'Hello', 
    answer:'Hi, How can I assist you?'
  }]

  return  (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-center">
        Chat With AI
      </h1>
      <div className="flex flex-col items-center justify-between">
        <div className={`w-80vw h-80vh bg-white border-2 border-indigo-100 rounded-lg`}>
          <div className="w-full h-full overflow-y-scroll rounded-lg">
            {chatHistory.map((chat, index) => 
              <ChatMessage
                key={index}
                message={chat}
                lastIndex={index===chatHistory.length-1?true:false}
                loading={loading}
              />)}
          </div>
        </div>
        <form 
          onSubmit={handleSubmit} 
          className="flex item-center w-80vw my-4 p-2 border-2 border-indigo-300 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring focus:ring-stone-300 focus:ring-offset-red"
        >
          <textarea
            ref={textAreaRef}
            disabled={loading}
            autoFocus={false}
            rows={1}
            maxLength={512}
            id="userInput"
            name="userInput"
            placeholder="Click to send a message, and click shift + enter to go to the next line."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className={`w-80vw placeholder-gray-400 focus: p-2 ${loading && 'opacity-50'}focus:ring-stone-100 focus:outline-none`}
          />
          <ArrowButton disabled={userInput===''} />
        </form>
      </div>
    </div> 
  )  
}
export default HomePage

