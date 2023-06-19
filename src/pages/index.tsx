import {useState, useRef } from 'react';
import ArrowButton  from '@/src/components/ArrowButton';

const HomePage = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = () => {

  }

  return  (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-center">
        Chat With AI
      </h1>
      <div className="flex flex-col items-center justify-between">
        <form onSubmit={handleSubmit} className="flex item-center w-4/5 my-4 p-2 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring focus:ring-stone-300 focus:ring-offset-red">
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
              className={`placeholder-gray-100 focus: p-2 ${loading ? 'opacity-50' : ''} w-80vw focus:ring-stone-100 focus:outline-none`}
            />
            <ArrowButton disabled={userInput===''} />
        </form>
      </div>
    </div> 
  )  
}
export default HomePage

