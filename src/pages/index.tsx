import {useState, useRef, useCallback, useEffect, ChangeEvent,FormEvent, FC } from 'react'
import {GetStaticProps} from 'next'

import { fetchData } from '@/src/utils/fetchData'
import ArrowButton  from '@/src/components/ArrowButton'
import ChatMessage from '@/src/components/ChatMessage'
import DropdownSelect from '@/src/components/DropdownSelect'
import Header from '@/src/components/Header'
import ImageListWithModal from '@/src/components/ImageListWithModal'
import ImageUploadIcon from '@/src/components/ImageUploadIcon'
import Notification from '@/src/components/Notification'
import { Message } from '@/src/types/chat'
import { OptionType } from '@/src/types/common'

const modelOptions: OptionType[] = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5', category: 'openai' },
  { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5-16k', category: 'openai' },
  { value: 'gpt-3.5-turbo-1106', label: 'GPT-3.5-16k-Latest', category: 'openai' },
  { value: 'gpt-4-1106-preview', label: 'GPT-4-128k-Preview', category: 'openai' },
  { value: 'gpt-4-vision-preview', label: 'GPT-4-128k-Vision-Preview', category: 'openai' },
  { value: 'gpt-4', label: 'GPT-4', category: 'openai' },
  { value: 'gpt-4-32k', label: 'GPT-4-32k', category: 'openai' },
  { value: 'meta-llama/Llama-2-7b-chat-hf', label: 'Llama-2-7b-chat-hf', category:'hf-large' }, 
  { value: 'llama3-8b-8192', label: 'LLaMA3 8b',  category:'groq' },
  { value: 'llama3-70b-8192', label: 'LLaMA3 70b',  category:'groq' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7b',  category:'groq' },
  { value: 'gemma-7b-it', label: 'Gemma 7b',  category:'groq' }
]

const initialFileCategory: OptionType = {value: 'none', label: 'None'}

const initialMessage = {
  question: '', 
  answer:'Hi, how can I assist you?'
}

const HomePage : FC<{
  isNewChat: boolean, 
  setIsNewChat: (value: boolean) => void, 
  namespaces: string[]
}> = ({ isNewChat, setIsNewChat, namespaces}) => {

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<HTMLDivElement | null> (null)

  const fileCategoryOptions = namespaces === null ?[ initialFileCategory]: [ initialFileCategory, ...namespaces.map(ns => ({ value: ns, label: ns}))];
  const [selectedNamespace, setSelectedNamespace] = useState<OptionType | null>( initialFileCategory)

  const [selectedModel, setSelectedModel] = useState<OptionType | null>(modelOptions[0])
  const [basePrompt, setBasePrompt] = useState('')

  const [userInput, setUserInput] = useState<string>('')
  const [rows, setRows] = useState<number>(1)
  const [chatHistory, setChatHistory] = useState<Message[]>([ initialMessage ])

  const [imageSrc, setImageSrc] = useState<string[]>([])
  const [imageSrcHistory, setImageSrcHistory] = useState<string[][]>([[]])

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchChatResponse = async (basePrompt:string, question: string, namespace: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          basePrompt,
          question,
          chatHistory,
          namespace,
          selectedModel
        }),
      })

      //handling server-side errors
      if (!response.ok) {
        const errorData = await response.json()

        setError("There is a server side error. Try it again later.")
        setLoading(false)
        return
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

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const question : string = userInput.trim()
    // prevent form submission if no text is entered
    if(question.length === 0 && imageSrc.length === 0) return

    setImageSrcHistory([...imageSrcHistory, imageSrc])
    
    setChatHistory([...chatHistory.slice(0, chatHistory.length), {question: userInput, answer: ''}])
    setError(null)
    setLoading(true)
    setUserInput('')
    setImageSrc([])
    setRows(1) // Reset the textarea rows to initial state

    fetchChatResponse(basePrompt, question, selectedNamespace?.value || 'none')
  }, [userInput, imageSrc, fetchChatResponse])

  const handleModelChange = (selectedOption: OptionType | null) => {
    setSelectedModel(selectedOption)
  }

  const handleNamespaceChange = (selectedOption: OptionType | null) => {
    setSelectedNamespace(selectedOption)
  }

  const handleBasePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const basePrompt= e.target.value
    setBasePrompt(basePrompt)
  }
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setUserInput(newValue)
    const newRows = newValue.match(/\n/g)?.length ?? 0
    setRows(newRows + 1)
  }

  const handleImageUpload = (file: File) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageSrc([...imageSrc,reader.result as string])
      };
      reader.readAsDataURL(file)
    }
  }

  const handleImageDelete = (id: number) =>{
    setImageSrc([...imageSrc.slice(0, id), ...imageSrc.slice(id+1)])
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
        handleSubmit(e as any)
        setRows(1)
      }
    }
    const currentTextArea = textAreaRef.current
    if (currentTextArea) {
      currentTextArea.addEventListener('keydown', keyDownHandler)
      currentTextArea.scrollTop = currentTextArea.scrollHeight
    }
  
    return () => {
      if (currentTextArea) {
        currentTextArea.removeEventListener('keydown', keyDownHandler)
      }
    }
  
  }, [handleSubmit])

  useEffect(() => {
    if(messagesRef.current !== null) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [chatHistory])

  useEffect(() => {
    if (isNewChat) {
      setChatHistory([initialMessage])
      setIsNewChat(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps    
  }, [isNewChat])

  return  (
    <div className="flex flex-col">
      <Header pageTitle="Chat With AI" />
      <div className="flex flex-col  items-center justify-center">
      <div className="flex flex-row w-80vw justify-around">
        <DropdownSelect 
          selectedOption={selectedModel} 
          onChange={handleModelChange}
          options={modelOptions}
          label='Choose AI Model:'
        />
        <DropdownSelect 
          selectedOption={selectedNamespace} 
          onChange={handleNamespaceChange}
          options={fileCategoryOptions}
          label='Using Saved File:'
        />
      </div>      
      <div  className="flex flex-col w-80vw item-center py-2"
      >
        <label htmlFor="userSystemPrompt" className="text-base font-bold">Enter text here for AI to remember throughout the chat:</label>
        <textarea
          id="userSystemPrompt"
          rows={2} 
          name='userSystemPrompt'
          onChange={handleBasePromptChange}
          value={basePrompt}
          className={`w-full placeholder-gray-400 my-2 p-2 border-2 border-indigo-300 rounded focus:ring-stone-100 focus:outline-none hover:bg-stone-50`}
          aria-label="Enter text here for AI to remember throughout the chat"
        />   
      </div>      
      <div className="flex flex-col w-80vw h-60vh items-center justify-between">
        <div className={`w-80vw grow bg-white border-2 border-stone-200 overflow-y-auto`}>
          <div  
            className="w-full h-full overflow-y-scroll rounded-lg"
            aria-live="polite"
            aria-atomic="true"
            ref={messagesRef}
          >
            {chatHistory.map((chat, index) => 
              <div key={index}>                
                <ChatMessage
                message={chat}
                lastIndex={index===chatHistory.length-1?true:false}
                loading={loading}
                imageSrc={imageSrcHistory[index]}
                handleImageDelete={handleImageDelete}
              />
              </div>
              )
            }
          </div>
        </div>
         <ImageListWithModal
           imageSrc={imageSrc}
           handleImageDelete={handleImageDelete}
           isDeleteIconShow={true}
          />
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
            className={`w-80vw max-h-96 placeholder-gray-400 overflow-y-auto focus: p-3 ${loading && 'opacity-50'} focus:ring-stone-100 focus:outline-none`}
            placeholder="Click to send a message, and push Shift + Enter to move to the next line."
            value={userInput}
            onChange={handleInputChange}
            aria-label="Enter your message here"
          />
          <ImageUploadIcon onImageUpload={handleImageUpload} />
          <ArrowButton disabled={userInput==='' && imageSrc.length === 0} />
        </form>
        { error && <Notification type="error" message={error} /> }      
        </div>
      </div>       
    </div>    
  )  
}
export default HomePage

export const getStaticProps: GetStaticProps = async () => {

  const response = await fetchData('namespaces')
  const namespaces = response?.namespaces || null // default to null if undefined

  return {
    props: {
      namespaces
    },
    revalidate: 60 * 60 * 24 // Regenerate the page after every 24 hours
  }
}