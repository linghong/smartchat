import {useState, useRef, useCallback, useEffect } from 'react'
import ArrowButton  from '@/src/components/ArrowButton'
import ChatMessage from '@/src/components/ChatMessage'
import { Message } from '@/src/types/chat'

const nameSpace = process.env.NAME_SPACE?? ''

const HomePage = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const [userInput, setUserInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      question: '', 
      answer:'Hi, how can I assist you?'
    }])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
  
    const question : string = userInput.trim()
    // prevent form submission if no text is entered
    if(question.length === 0) return
  
    setChatHistory([...chatHistory.slice(-1), {question: userInput, answer: ''}])
    setError(null)
    setLoading(true)
    setUserInput('')

    handleAPI(question, nameSpace)
  }, [userInput])

  const handleAPI = async (question: string, nameSpace: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          chatHistory,
          nameSpace
        }),
      });

      const data = await response.json();

      setChatHistory([...chatHistory.slice(-1), {question: userInput, answer: data}]);
      setLoading(false);

    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      e.preventDefault()

      //insert newline /when using shift + enter
      if ( e.shiftKey) {       
        setUserInput(prevState => prevState + "\n")
      } else {
        //submit question
        handleSubmit(e as any)
      }
    }

    if (textAreaRef.current) {
      textAreaRef.current.addEventListener('keydown', keyDownHandler)
    }
  
    return () => {
      if (textAreaRef.current) {
        textAreaRef.current.removeEventListener('keydown', keyDownHandler)
      }
    }
  
  }, [handleSubmit])

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
            placeholder="Click to send a message, and push Shift + Enter to move to the next line."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className={`w-80vw placeholder-gray-400 focus: p-2 ${loading && 'opacity-50'}focus:ring-stone-100 focus:outline-none`}
          />
          <ArrowButton disabled={userInput===''} />
        </form>
        {error && (
          <div className="p-4">
            <p className="font-bold text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div> 
  )  
}
export default HomePage

