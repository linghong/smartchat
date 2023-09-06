import {useState, useRef, useCallback, useEffect, ChangeEvent, FC } from 'react'
import ArrowButton  from '@/src/components/ArrowButton'
import ChatMessage from '@/src/components/ChatMessage'
import { Message } from '@/src/types/chat'
import DropDownSelect, { OptionType } from '@/src/components/DropDownSelect'

const nameSpace = process.env.NEXT_PUBLIC_NAME_SPACE?? ''

const options: OptionType[] = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5' },
  { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5-16k' },
  { value: 'gpt-4', label: 'GPT-4' }
];

const initialMessage = {
  question: '', 
  answer:'Hi, how can I assist you?'
}

const HomePage : FC<{isNewChat: boolean, setIsNewChat: (value: boolean) => void}> = ({ isNewChat, setIsNewChat }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<HTMLDivElement | null> (null)

  const [userInput, setUserInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<number>(1)
  const [selectedModel, setSelectedModel] = useState<OptionType | null>(options[0])
  const [chatHistory, setChatHistory] = useState<Message[]>([ initialMessage ])

  const fetchChatResponse = async (question: string, nameSpace: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          chatHistory,
          nameSpace,
          selectedModel
        }),
      })

      //handling server-side errors
      if (!response.ok) {
        const errorData = await response.json();

        setError("There is a server side error. Try it again later.");
        setLoading(false);
        return;
      }

      const data = await response.json()

      setChatHistory([...chatHistory.slice(0, chatHistory.length), {question: userInput, answer: data}])
      setLoading(false)

    } catch (error) {
      setLoading(false)
      setError('An error occurred while fetching the data. Please try again.')
      console.error('error', error)
    }
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
  
    const question : string = userInput.trim()
    // prevent form submission if no text is entered
    if(question.length === 0) return
  
    setChatHistory([...chatHistory.slice(0, chatHistory.length), {question: userInput, answer: ''}])
    setError(null)
    setLoading(true)
    setUserInput('')

    fetchChatResponse(question, nameSpace)
  }, [userInput])

  const handleModelChange = (selectedOption: OptionType | null) => {
    setSelectedModel(selectedOption)
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setUserInput(newValue)
    const newRows = newValue.match(/\n/g)?.length ?? 0
    setRows(newRows + 1)
  }

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      e.preventDefault()

      //insert newline \n when using shift + enter
      if ( e.shiftKey) {       
        setUserInput(prevState => prevState + "\n")
        setRows(rows => rows + 1)
      } else {
        //submit question
        handleSubmit(e as any)
        setRows(1)
      }
    }

    if (textAreaRef.current) {
      textAreaRef.current.addEventListener('keydown', keyDownHandler)
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  
    return () => {
      if (textAreaRef.current) {
        textAreaRef.current.removeEventListener('keydown', keyDownHandler)
      }
    }
  
  }, [handleSubmit])

  useEffect(() => {
    if(messagesRef.current !== null) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatHistory])

  useEffect(() => {
    if (isNewChat) {
      setChatHistory([initialMessage])
      setIsNewChat(false)
    }  
  }, [isNewChat])

  return  (
    <div className="flex flex-col">
      <DropDownSelect 
        selectedOption={selectedModel} 
        onChange={handleModelChange}
        options={options}
        label='Choose AI Model:'
      />
      <div className="flex flex-col h-80vh items-center justify-between">
        <div className={`w-80vw grow bg-white border-2 border-indigo-100 rounded-lg chat-container`}>
          <div  
            className="w-full h-full overflow-y-scroll rounded-lg"
            ref={messagesRef}
          >
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
            rows={rows}
            id="userInput"
            name="userInput"
            placeholder="Click to send a message, and push Shift + Enter to move to the next line."
            value={userInput}
            onChange={handleInputChange}
            className={`w-80vw max-h-96 placeholder-gray-400 overflow-y-auto focus: p-3 ${loading && 'opacity-50'} focus:ring-stone-100 focus:outline-none`}
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