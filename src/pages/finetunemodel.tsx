import { FC, ChangeEvent, MouseEvent, useState, useEffect } from 'react'
import { ActionMeta} from 'react-select'

import Header from '@/src/components/Header'
import UploadFile from '@/src/components/UploadFile'
import Checkbox from '@/src/components/Checkbox'
import DropDownSelect from '@/src/components/DropdownSelect'
import { OptionType } from '@/src/types/common'
import { useFormSubmission } from '@/src/hooks'

interface DropDownData {
  finetuningModel: {
    value: string;
    label: string;
  }
}

interface InputData {
  batchSize: string;
  epochs: string;
  learningRateMultiplier: string;
  promptLossWeight: string;
}

interface InputErrors {
  [key: string]: string | null
}

const finetuningOptions = [
  { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
  { value: 'Llama-13B-GGUF', label: 'Llama-13B-GGUF'},
  { value: 'CodeLlama-13B-GGUF', label: 'CodeLlama-13B-GGUF'}
]
const initialInput = {
  batchSize: '4',
  epochs: '10',
  learningRateMultiplier: '0.1',
  promptLossWeight: '0.01'
}

const initialSelectedDropdown = {
  finetuningModel: finetuningOptions[0],
}
const FinetuneModel: FC = () => {

  const [selectedFile, setSelectedFile] =useState<File | null>(null)
  const [selectedDropDown, setSelectedDropDown] = useState<DropDownData>(initialSelectedDropdown)
  const [selectedInput, setSelectedInput] = useState<InputData>(initialInput)

  // OpenAI no longer allows optional parameter selection except for the number of epochs.
  const isOpenAIModel = selectedDropDown.finetuningModel.value === 'gpt-3.5-turbo'

  const [isChecked, setIsChecked] = useState<boolean>(false)

  const [uploadError, setUploadError] = useState< string | null>(null)
  const [inputErrors, setInputErrors] = useState<InputErrors>({
    batchSize: null,
    epochs: null,
    learningRateMultiplier: null,
    promptLossWeight: null,
    integer: null
  })

  const [notification, setNotification] = useState<string | null> (null)

  const handleDropDownChange = (selectedOption: OptionType | null, actionMeta: ActionMeta<OptionType>) => {
    if (selectedOption === null) return;
    if(actionMeta.name === 'finetuningModel'){
      setSelectedDropDown({
        ...selectedDropDown,
        [actionMeta.name]: selectedOption
      })
    }
  }

  const validateInput = (name: string, value: number) => {
    if (value === null){
      setInputErrors(prev => ({...prev, [name]: `${name}'s value cannot be empty.`}))

    } else if (value <= 0) {
      setInputErrors(prev => ({...prev, [name]: `${name}'s value cannot be negative or zero.`}))

    } else if ((name ==='epochs' || name === 'batchSize') && !Number.isInteger(value)) {
      setInputErrors(prev => ({...prev, [name]: `${name} should be an integer.`}))

    } else {
      setInputErrors(prev => ({...prev, [name]: null, ['nullValue']: null }))
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name
    let value = e.target.value
    
    // Remove leading zeroes
    value = value.replace(/^0+/, '');

    if(inputErrors[name]) validateInput(name, parseFloat(value))
    
    setSelectedInput({
      ...selectedInput,
      [name]: value
    })
  }
  const handleInputBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = parseInt(e.target.value)     
    
    validateInput(name, value)
  }

  const { handleFormSubmit, isLoading, successMessage, error } = useFormSubmission()

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if(!selectedFile) {
      setInputErrors(prev => ({...prev, ['upload']: 'You must upload a file.'}))
      return
    }
  
    if(uploadError) return

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('finetuning', selectedDropDown.finetuningModel.value)
    formData.append('epochs', selectedInput.epochs)
    formData.append('batchsize', selectedInput.batchSize)
    formData.append('learningRateMultiplier', selectedInput.learningRateMultiplier)
    formData.append('promptLossWeight', selectedInput.promptLossWeight)

    await handleFormSubmit('/api/finetune', formData)
  }

  useEffect (() => {
    if(isChecked){
      setSelectedInput(prev => ({
        ...prev,
        ['epochs']: 'default'
      }))
    } else {
      setSelectedInput(prev => ({
        ...prev, 
        ['epochs']: initialInput.epochs
      }))
    }
  }, [isChecked])

  return (
    <div className="flex flex-col items-center w-full">
      <div className="sr-only" aria-live="polite" aria-atomic="true" >
        {notification}
      </div>
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
          <DropDownSelect
            name='finetuningModel' 
            selectedOption={selectedDropDown.finetuningModel} 
            onChange={handleDropDownChange}
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
            value={selectedInput.epochs}
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
              value={selectedInput.batchSize}
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
              value={selectedInput.learningRateMultiplier}
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
              value={selectedInput.promptLossWeight}
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
        {isLoading && <p className="bold" role="status">Uploading your data... </p>}
        {successMessage && <p className="bold text-green-600" role="status">{successMessage}</p>}
        {error && <p className="bold text-red-600" role="alert">{error}</p>}
        {uploadError && <p className="text-red-600">{uploadError}</p>}
        {Object.keys(inputErrors).map((key, i) => 
          <p key={`${key}-error`} className="text-red-600">{inputErrors[key]}</p>
        )}       
      </form>
      <div className="flex flex-col h-40vh items-center justify-between"></div>      
    </div>
  )
}

export default FinetuneModel

