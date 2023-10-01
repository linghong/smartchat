import { FC, MouseEvent, useState, useEffect } from 'react'
import { ActionMeta} from 'react-select'

import Checkbox from '@/src/components/Checkbox'
import DropdownSelect from '@/src/components/DropdownSelect'
import Header from '@/src/components/Header'
import Notification from '@/src/components/Notification'
import UploadFile from '@/src/components/UploadFile'
import { OptionType, InputErrors, InputData } from '@/src/types/common'
import { useFormSubmission, useInputChange } from '@/src/hooks'

interface DropdownData {
  finetuningModel: {
    value: string;
    label: string;
  }
}

const finetuningOptions = [
  { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
  { value: 'Llama-13B-GGUF', label: 'Llama-13B-GGUF'},
  { value: 'CodeLlama-13B-GGUF', label: 'CodeLlama-13B-GGUF'}
]

const initialInput = {
  batchSize: 4,
  epochs: 10,
  learningRateMultiplier: 0.1,
  promptLossWeight: 0.01
}

const initialInputErrors = {
  batchSize: null,
  epochs: null,
  learningRateMultiplier: null,
  promptLossWeight: null,
  integer: null
}

const initialSelectedDropdown = {
  finetuningModel: finetuningOptions[0],
}

const FinetuneModel: FC = () => {
 
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDropdown, setSelectedDropdown] = useState<DropdownData>(initialSelectedDropdown)
 
  // OpenAI no longer allows optional parameter selection except for the number of epochs.
  const isOpenAIModel = selectedDropdown.finetuningModel.value === 'gpt-3.5-turbo'

  const [isChecked, setIsChecked] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState< string | null>(null)

  const handleDropdownChange = (selectedOption: OptionType | null, actionMeta: ActionMeta<OptionType>) => {
    if (selectedOption === null) return;
    if(actionMeta.name === 'finetuningModel'){
      setSelectedDropdown({
        ...selectedDropdown,
        [actionMeta.name]: selectedOption
      })
    }
  }

  const validateInput = (name: string, value: number | string) => {
    if(typeof value === 'string') {
      setInputErrors((prev: InputErrors) => ({ ...prev, [name]: `${name} must be a number.` }))

    } else if (!value) {
        setInputErrors((prev: InputErrors) => ({ ...prev, [name]: `${name}'s value cannot be empty.` }))

    } else if (value <= 0) {
        setInputErrors((prev: InputErrors) => ({ ...prev, [name]: `${name}'s value cannot be negative or zero.` }))

    } else if ((name === 'epochs' || name === 'batchSize') && !Number.isInteger(value)) {
        setInputErrors((prev: InputErrors) => ({ ...prev, [name]: `${name} should be an integer.` }))
        
    } else {
        setInputErrors((prev: InputErrors) => ({ ...prev, [name]: null }));
    }
  }

  const { selectedInput, inputErrors, setSelectedInput, setInputErrors, handleInputChange, handleInputBlur } = useInputChange({ initialInput, initialInputErrors, validateInput })

  const { handleFormSubmit, isLoading, successMessage, error } = useFormSubmission()

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if(!selectedFile) {
      setInputErrors((prev: InputErrors) => ({...prev, ['upload']: 'You must upload a file.'}))
      return
    }  
    if(uploadError) return

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    if(!serverUrl) {
      return {error: 'Url address for posting the data is missing'}
    }
    const serverSecretKey= process.env.NEXT_PUBLIC_SERVER_SECRET_KEY
    if(!serverSecretKey) {
      return {error: 'Sever secret key is missing'}
    }
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('finetuning', selectedDropdown.finetuningModel.value)
    formData.append('epochs', (selectedInput.epochs)?.toString() ?? '')

    if(selectedInput.finetuning = "gpt-3.5-turbo") {   
      await handleFormSubmit(`${serverUrl}/api/finetuning/openai`, formData, serverSecretKey)

    } else {  

      formData.append('batchsize', (selectedInput.batchSize)?.toString() ?? '')
      formData.append('learningRateMultiplier', (selectedInput.learningRateMultiplier)?.toString() ?? '')
      formData.append('promptLossWeight', (selectedInput.promptLossWeight)?.toString() ?? '')
      
      await handleFormSubmit(`${serverUrl}/api/finetuning/peft`, formData, serverSecretKey)
    }   
  }

  useEffect (() => {
    if(isChecked){
      setSelectedInput((prev: InputData) => ({
        ...prev,
        ['epochs']: ''
      }))
    } else {
      setSelectedInput((prev: InputData)  => ({
        ...prev, 
        ['epochs']: initialInput.epochs
      }))
    }
  }, [isChecked, setSelectedInput])

  return (
    <div className="flex flex-col items-center w-full">
      <Header pageTitle="Finetune AI Model" />
      <form className="flex flex-col  p-10 justify-start bg-slate-50 border border-indigo-100">
        <UploadFile 
          label="Upload Training Data: "
          fileType=".jsonl"
          uploadError={uploadError}
          setUploadError={setUploadError}
          setSelectedFile={setSelectedFile}
        /> 
        <div className="flex justify-start my-5">
          <DropdownSelect
            name='finetuningModel' 
            selectedOption={selectedDropdown.finetuningModel} 
            onChange={handleDropdownChange}
            options={finetuningOptions}
            label='Select Finetuning Model:'
          />
        </div>
        <div className="my-5">
          <label htmlFor="epochs" className="font-bold mr-2 py-1.5">
            Number of Epochs:
          </label>
          <input 
            type="number"
            name="epochs"
            value={(selectedInput.epochs)?.toString()}
            className="w-50 bg-transparent hover:bg-slate-100 text-stone-700 font-semibold mr-20 py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-sky-800 focus:outline-none"
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
           <p>Number of training cycles. Excessive training can lead to overfitting; too few can result in underfitting.</p>
          { 
            isOpenAIModel && <Checkbox 
            label="Let OpenAI decide epochs" 
            setIsChecked={setIsChecked}/>
          }
        </div>
        { 
          !isOpenAIModel && <div className="my-5">
            <label htmlFor="batchSize" className="font-bold mr-2 py-1.5">
              Batch Size:
            </label>
            <input 
              type="number"
              name="batchSize"
              value={selectedInput.batchSize?.toString()}
              className="bg-transparent hover:bg-slate-100 text-stone-700 font-semibold py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-sky-800 focus:outline-none"
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />
            <p>Number of samples processed together. Ensure each batch&apos;s total token count should not exceed the model&apos;s token limit.</p>
          </div> 
        }
        { 
          !isOpenAIModel && <div className="my-5">
            <label htmlFor="learningRateMultiplier" className="font-bold mr-2 py-1.5">
              Learning Rate Multiplier:
            </label>
            <input 
              type="number"
              name="learningRateMultiplier"
              value={selectedInput.learningRateMultiplier?.toString()}
              className="bg-transparent hover:bg-slate-100 text-stone-700 font-semibold py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-sky-800 focus:outline-none"
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />
            <p>Controls the decay of the model&apos;s learning rate. A higher rate speeds up learning but risks overshooting optimal results.</p>
          </div>
        }
        {
          !isOpenAIModel && <div className="my-5">
            <label htmlFor="promptLossWeight" className="font-bold mr-2 py-1.5">
              Prompt Loss Weight:
            </label>
            <input
              type="number"
              name="promptLossWeight"
              value={selectedInput.promptLossWeight?.toString()}
              className="bg-transparent hover:bg-slate-100 text-stone-700 font-semibold py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-sky-800 focus:outline-none"
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />
            <p>controls the balance between model&apos;s adherence to prompts and its text generation capability</p>
          </div>
        }
        <div className="flex justify-end my-2">
          <button
            type="submit"
            className=  {`bg-transparent hover:bg-slate-500 text-stone-700 font-semibold mr-10 py-3 px-10 border-2 border-stone-400 hover:border-transparent rounded-3xl focus:border-blue-500 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'hover:text-white'}`}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Submit
          </button>
        </div>
        { isLoading && <Notification type="loading" message="Uploading your data..." /> }
        { <Notification type="success" message={successMessage} /> }
        { <Notification type="error" message={error} /> }
        { <Notification type="error" message={uploadError} /> }
        { Object.keys(inputErrors).map((key, i) => 
          <Notification key={`${key}-error`} type="error" message={inputErrors[key]} />
        )}
      </form>
      <div className="flex flex-col h-40vh items-center justify-between"></div>
    </div>
  )
}

export default FinetuneModel

