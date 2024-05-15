import { FC, MouseEvent, useState } from 'react'
import { GetStaticProps } from 'next'
import { ActionMeta} from 'react-select'

import DropDownSelect from '@/src/components/DropdownSelect'
import Header from '@/src/components/Header'
import Notifications from '@/src/components/Notification'
import PlusIcon from '@/src/components/PlusIcon'
import UploadFile from '@/src/components/UploadFile'
import { useFormSubmission,  useInputChange } from '@/src/hooks'
import { OptionType, InputErrors, UploadData, UploadErrors } from '@/src/types/common'
import { fetchData } from '@/src/utils/fetchData'

interface DropDownData {
  fileCategory: {
    value: string;
    label: string;
  };
  embeddingModel: {
    value: string;
    label: string;
  };
}

const MIN_CHUNK_SIZE = 50 
const MAX_CHUNK_SIZE = 4000 
const MIN_CHUNK_OVERLAP = 0
const MAX_CHUNK_OVERLAP = 800

const embeddingModelOptions = [
  { value: 'openAI', label: 'Open AI embedding' },
]

const initialInput = {
  chunkSize: 800,
  chunkOverlap: 300,
  newFileCategory: 'default'
}

const initialInputErrors = {
  chunkSize: null,
  chunkOverlap: null,
  newFileCategory: null,
  selectedFileCategory: null,
}

const UploadFilePage: FC<{namespaces : string[]}> = ({namespaces}) => {

  const defaultFileCategoryOptions = [ { value: 'default', label: 'Add New Category' }, ...namespaces.map(ns => ({ value: ns, label: ns }))]

  const [fileCategoryOptions, setFileCategoryOptions] = useState<OptionType[]>(defaultFileCategoryOptions)
  const [showAddNewCategory, setShowAddNewCategory] = useState(false) 

  const [selectedUpload, setSelectedUpload] =useState<UploadData>({
    ['file']: null
  })
  const [uploadErrors, setUploadErrors] = useState< UploadErrors>({['file']: null})

  const [selectedDropDown, setSelectedDropDown] = useState<DropDownData>({
    fileCategory: defaultFileCategoryOptions[0],
    embeddingModel: embeddingModelOptions[0],
  })

  const validateInput = (name: string, value: number | string) => {
    const {chunkSize, chunkOverlap, newFileCategory } = selectedInput
    
    if(name === 'newFileCategory') {
      if(!value) setInputErrors((prev:InputErrors) => ({...prev, [name]: `${name} cannot be empty.`}))

    } else if (typeof chunkSize !== 'number' || typeof chunkOverlap !== 'number' || typeof value !== 'number'){
      setInputErrors((prev: InputErrors) => ({...prev, [name]: `${name} must be a number.`}))

    } else if (value <= 0) {
      setInputErrors((prev: InputErrors) => ({ ...prev, [name]: `${name}'s value cannot be negative or zero.` }))

    } else if (!Number.isInteger(value)) {
      setInputErrors((prev: InputErrors) => ({...prev, [name]: `${name} must be an integer.`}))

    } else if (name === 'chunkSize' && (value < MIN_CHUNK_SIZE || value > MAX_CHUNK_SIZE)) {
      setInputErrors((prev: InputErrors) => ({...prev, [name]: `${name} must be between ${MIN_CHUNK_SIZE} and ${MAX_CHUNK_SIZE}`}))

    } else if (name === 'chunkOverlap' && (value < MIN_CHUNK_OVERLAP || value > MAX_CHUNK_OVERLAP)) {
      setInputErrors((prev: InputErrors) => ({...prev, [name]: `${name} must be between ${MIN_CHUNK_OVERLAP} and ${MAX_CHUNK_OVERLAP}`}))

    } else if ( chunkOverlap >= chunkSize) {
      setInputErrors( (prev: InputErrors) => ({...prev, [name]: "Chunk Size must be greater than Chunk Overlap size."}))

    } else {
      setInputErrors((prev:InputErrors) => ({...prev, [name]: null}))
    }
  }

  const { selectedInput, inputErrors, setSelectedInput, setInputErrors, handleInputChange, handleInputBlur } = useInputChange({ initialInput, initialInputErrors, validateInput })

  const handleAddCategoryToDropDown = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const newFileCategory = selectedInput?.newFileCategory
    if(typeof newFileCategory !== 'string') return

    const newCategoryOption = {
      'value': newFileCategory.replace(/\s+/g, '').toLowerCase(),
      'label': newFileCategory
    }

    setSelectedDropDown(prevSelected => ({
      ...prevSelected,
      'fileCategory': newCategoryOption
    }))

    // Check if the new category already exists in namespaces
    if (namespaces.includes(newFileCategory)) {
      setInputErrors((prev: InputErrors) => ({...prev, ['newFileCategory']: "This category already exists."}))
      return
    }

    setFileCategoryOptions(previousOptions => [
      ...previousOptions, newCategoryOption])
    setInputErrors((prev: InputErrors) => ({...prev, ['newFileCategory']: null}))
    setShowAddNewCategory(false)
  }

  const handleDropDownChange = (selectedOption: OptionType | null, actionMeta: ActionMeta<OptionType>) => {
    if (selectedOption === null) return;

    if(actionMeta.name === 'embeddingModel'){
      setSelectedDropDown({
        ...selectedDropDown,
        [actionMeta.name]: selectedOption
      })

    } else if(actionMeta.name === 'fileCategory' &&  selectedOption?.value === 'default'){
      setShowAddNewCategory(true)

    } else {
      setShowAddNewCategory(false)
      setSelectedDropDown({
        ...selectedDropDown, 
        'fileCategory': selectedOption
      })
      setInputErrors((prev: InputErrors) => ({...prev, ['newFileCategory']: null}))
    }    
  }
  const { handleFormSubmit, isLoading, successMessage, error } = useFormSubmission()

  const prepareFormData = () => {
    const formData = new FormData()
    if(selectedUpload.file) formData.append('file', selectedUpload.file)
    formData.append('chunkSize', (selectedInput.chunkSize)?.toString() ?? '')
    formData.append('chunkOverlap', (selectedInput.chunkOverlap)?.toString() ?? '')
    formData.append('fileCategory', JSON.stringify(selectedDropDown.fileCategory))
    formData.append('embeddingModel', JSON.stringify(selectedDropDown.embeddingModel))
    return  formData
  }

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if(!selectedUpload) {
      setUploadErrors((prev: InputErrors) => ({...prev, ['file']: 'You must upload a file.'}))
    }
  
    const hasErrors = !selectedUpload || Object.values(inputErrors).some(e => e !== null)
    if(hasErrors) return

    const formData = await  prepareFormData()
    await handleFormSubmit('/api/upload', formData) 
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Header pageTitle="Manage My AI" />
      <form className="flex flex-col h-60vh lg:h-40vh p-3 justify-between ">        
        <div className="flex flex-col my-5 p-5 bg-slate-50  border border-indigo-100 shadow-md rounded">
          <UploadFile 
            label="Upload File: "
            fileType=".pdf"
            name='uploadFile'
            uploadErrors={uploadErrors}
            setUploadErrors={setUploadErrors}
            setSelectedUpload={setSelectedUpload}
          /> 
          <div className="flex flex-col lg:flex-row justify-start"> 
            <div className="lg:w-50 mr-20 my-2">
              <DropDownSelect
                name='fileCategory' 
                selectedOption={selectedDropDown.fileCategory} 
                onChange={handleDropDownChange}
                options={fileCategoryOptions}
                label='Select File Category:'
              />
            </div>       
            {showAddNewCategory && 
              <div className="flex items-center lg:w-50 my-2">
                <label htmlFor="newCategoryOption" className="font-bold mr-5">
                  New Category:
                </label>
                <input 
                  type="text"
                  name="newFileCategory"
                  className="bg-transparent hover:bg-slate-100 text-stone-700 font-semibold px-4 py-1.5 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-blue-500 focus:outline-none"
                  onChange={handleInputChange}
                />  
                <button 
                  className="py-1.5"
                  aria-label="Add New Category" 
                  onClick={handleAddCategoryToDropDown}
                >
                  <PlusIcon aria-hidden="true" />
                </button> 
              </div>
            }       
          </div> 
        </div>
        <div className="flex flex-col my-5 p-5 bg-slate-50  border border-indigo-100 shadow-md rounded">
          <div className="flex flex-col lg:flex-row justify-start">
            <div className="lg:w-50 my-5">
              <label htmlFor="chunkSize" className="font-bold mr-2 py-1.5">
                Chunk Size:
              </label>
              <input 
                type="number"
                name="chunkSize"
                value={selectedInput.chunkSize?.toString()}
                className="w-50 bg-transparent hover:bg-slate-100 text-stone-700 font-semibold mr-20 py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-sky-800 focus:outline-none"
                onChange={handleInputChange}
                onBlur={handleInputBlur}
              />
            </div>
            <div className="lg:w-50 my-5 justify-start">
              <label htmlFor="chunkOverlapSize" className="font-bold mr-2 py-1.5">
                Chunk Overlap:
              </label>
              <input 
                type="number"
                name="chunkOverlap"
                value={selectedInput.chunkOverlap?.toString()}
                className="w-50 bg-transparent hover:bg-slate-100 text-stone-700 font-semibold mr-20 py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-sky-800 focus:outline-none"
                onChange={handleInputChange}
                onBlur={handleInputBlur}
              />       
            </div>          
          </div>               
        </div>
        <div className="flex flex-col my-5 p-5 bg-slate-50  border border-indigo-100 shadow-md rounded">
          <div className="flex justify-start">
            <DropDownSelect
              name='embeddingModel' 
              selectedOption={selectedDropDown.embeddingModel} 
              onChange={handleDropDownChange}
              options={embeddingModelOptions}
              label='Embedding Model:'
            /> 
          </div>  
        </div>
      <div className="flex justify-end my-10">
        <button
          type="submit"
          className=  {`bg-transparent hover:bg-slate-500 text-stone-700 font-semibold mr-5 py-4 px-20 border-2 border-stone-400 hover:border-transparent rounded-3xl focus:border-blue-500 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'hover:text-white'}`}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          Submit
        </button>
        </div>        
        <Notifications
          isLoading={isLoading}
          loadingMessage="Uploading and processing your file. This may take a few minutes. Please wait..."
          successMessage={successMessage}
          errorMessage={error}
          uploadErrors ={uploadErrors}
          inputErrors={inputErrors}
        />
      </form>
      <div className="flex flex-col h-40vh items-center justify-between"></div>      
    </div>
  )
}

export default UploadFilePage

export const getStaticProps: GetStaticProps = async () => {
  const { namespaces } = await fetchData('namespaces');

  return {
    props: {
      namespaces
    },
    revalidate: 60 * 60 *24 // This is optional. It ensures regeneration of the page after every 24 hour
  }
}