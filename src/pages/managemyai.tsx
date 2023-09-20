import { FC, ChangeEvent, MouseEvent, useState } from 'react'
import {GetStaticProps} from 'next'
import { ActionMeta} from 'react-select'

import { fetchData } from '@/src/utils/fetchData'
import Header from '@/src/components/Header'
import DropDownSelect from '@/src/components/DropDownSelect'
import PlusIcon from '@/src/components/PlusIcon'
import { OptionType, ApiResponse } from '@/src/types/common'

interface InputData {
  chunkSize: number;
  chunkOverlap: number;
  newFileCategory: string;
}
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

const MIN_CHUNK_SIZE = 100 
const MAX_CHUNK_SIZE = 1500 
const MIN_CHUNK_OVERLAP = 0
const MAX_CHUNK_OVERLAP = 800

const embeddingModelOptions = [
  { value: 'openAI', label: 'Open AI embedding' },
]

const UploadFile: FC<{namespaces : string[]}> = ({namespaces}) => {

  const defaultFileCategoryOptions = [ { value: 'default', label: 'Add New Category' }, ...namespaces.map(ns => ({ value: ns, label: ns }))];
  
  const [selectedFile, setSelectedFile] =useState<File |null>(null)

  const [showAddNewCategory, setShowAddNewCategory] = useState(false) 
  const [fileCategoryOptions, setFileCategoryOptions] = useState<OptionType[]>(defaultFileCategoryOptions)

  const [selectedInput, setSelectedInput] = useState<InputData>({
    chunkSize: 800,
    chunkOverlap: 300,
    newFileCategory: ''
  })
  const [selectedDropDown, setSelectedDropDown] = useState<DropDownData>({
    fileCategory: defaultFileCategoryOptions[0],
    embeddingModel: embeddingModelOptions[0],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null> (null)
  const [error, setError] = useState<string | null> (null)
  const [inputErrors, setInputErrors] = useState<{[key: string]: string | null}>({
    chunkSize: null,
    chunkOverlap: null,
    newFileCategory: null,
    integer: null,
    selectedFileCategory: null,
    upload: null
  });

  const [notification, setNotification] = useState<string | null> (null)

  const handleFileChange= (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if(!files) return
    const file = files[0]
    if(file){
      //calculate file size with unit MB
      const fileSize = (file.size/(1024*1024))
      if(fileSize > 200) {
        setInputErrors(prev => ({...prev, ['upload']: "Maxmium file size  to upload is 200MB."}))
        return
      }
      setSelectedFile(files[0])
      if(inputErrors['upload']) setInputErrors(prev => ({...prev, ['upload']: null}))
    }
  }

  const handleAddCategoryToDropDown = (e:any) => {
    e.preventDefault()
    const newFileCategory = selectedInput.newFileCategory

    if (!newFileCategory) {
      setInputErrors(prev => ({...prev, ['newFileCategory']: "Category name cannot be empty."}))
      return
    } 

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
      setInputErrors(prev => ({...prev, ['newFileCategory']: "This category already exists."}))
      return
    }

    setFileCategoryOptions(previousOptions => [
      ...previousOptions, newCategoryOption])
    setInputErrors(prev => ({...prev, ['newFileCategory']: null}))
    setShowAddNewCategory(false)
  }

  const validateChunkInput = (name: string, value: number) => {
    if (!Number.isInteger(value)) {
      setInputErrors(prev => ({...prev, ['integer']: `${name} should be an integer.`}))
    } else {
      setInputErrors(prev => ({...prev, ['integer']: null }))
    }
    if (name === 'chunkSize') {
      if (value < MIN_CHUNK_SIZE || value > MAX_CHUNK_SIZE) {
        setInputErrors(prev => ({...prev, [name]: `Chunk Size must be between ${MIN_CHUNK_SIZE} and ${MAX_CHUNK_SIZE}`}))
      } else if (value <= selectedInput.chunkOverlap) {
        setInputErrors(prev => ({...prev, [name]: "Chunk Size must be greater than Chunk Overlap size."}))
      } else {
        setInputErrors(prev => ({...prev, [name]: null}))
      }

    } else if (name === 'chunkOverlap') {
      if (value < MIN_CHUNK_OVERLAP || value > MAX_CHUNK_OVERLAP) {
        setInputErrors(prev => ({...prev, [name]: `Chunk Overlap Size must be between ${MIN_CHUNK_OVERLAP} and ${MAX_CHUNK_OVERLAP}`}))
      } else if (value >= selectedInput.chunkSize) {
        setInputErrors(prev => ({...prev, [name]: "Chunk Overlap size must be smaller than Chunk Size."}))
      } else {
        setInputErrors(prev => ({...prev, [name]: null}))
      }
    }
  } 

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name
    let value = e.target.value
    
    // Remove leading zeroes
    value = value.replace(/^0+/, '');

    if(inputErrors[name]) validateChunkInput(name, parseFloat(value))
    
    setSelectedInput({
      ...selectedInput,
      [name]: value
    })
  }

  const handleInputBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = parseInt(e.target.value)     
    
    validateChunkInput(name, value)
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
      setInputErrors(prev => ({...prev, ['newFileCategory']: null}))
    }    
  }

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if(!selectedFile) {
      setInputErrors(prev => ({...prev, ['upload']: 'You must upload a file.'}))
    }
  
    const hasErrors = !selectedFile || Object.values(inputErrors).some(e => e !== null)
    if(hasErrors) return

    setIsLoading(true);
    setSuccessMessage(null);
    setError(null);

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('chunkSize', selectedInput.chunkSize.toString())
    formData.append('chunkOverlap', selectedInput.chunkOverlap.toString())
    formData.append('fileCategory', JSON.stringify(selectedDropDown.fileCategory))
    formData.append('embeddingModel', JSON.stringify(selectedDropDown.embeddingModel))

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data: ApiResponse = await res.json() as ApiResponse

      if (res.ok) {
        setSuccessMessage(`Upload success: ${data.message}`)
        setNotification(`Upload success: ${data.message}`)
      } else {
        setError(`Upload error: ${data.error}`)
        setNotification(`Upload error: ${data.error}`)
      }
    } catch (error) {
        setError('There was a network error when sending file:')
        console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="sr-only" aria-live="polite" aria-atomic="true" >
        {notification}
      </div>
      <Header pageTitle="Manage My AI" />
      <form className="flex flex-col h-60vh lg:h-40vh p-10 justify-between bg-slate-50 border border-indigo-100">
        <div className="my-2">
          <label 
            htmlFor="fileUpload" className="w-50 font-bold text-base mr-5">
            Upload File:
          </label>  
          <input 
              type="file"
              name="uploadFile" 
              accept=".pdf"
              onChange={handleFileChange}
              className="focus:border-blue-500 focus:outline-none"
          />
        </div>
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
        <div className="flex flex-col lg:flex-row justify-start">
          <div className="lg:w-50 my-5">
            <label htmlFor="chunkSize" className="font-bold mr-2 py-1.5">
              Chunk Size:
            </label>
            <input 
              type="number"
              name="chunkSize"
              value={selectedInput.chunkSize}
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
              value={selectedInput.chunkOverlap}
              className="w-50 bg-transparent hover:bg-slate-100 text-stone-700 font-semibold mr-20 py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-sky-800 focus:outline-none"
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />       
          </div>
          
        </div>
        <div className="flex justify-start my-2">
          <DropDownSelect
            name='embeddingModel' 
            selectedOption={selectedDropDown.embeddingModel} 
            onChange={handleDropDownChange}
            options={embeddingModelOptions}
            label='Embedding Model:'
          /> 
        </div>          
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
        {isLoading && <p className="bold" role="status">Uploading and processing your file. This may take a few minutes. Please wait...</p>}
        {successMessage && <p className="bold text-green-600" role="status">{successMessage}</p>}
        {error && <p className="bold text-red-600" role="alert">{error}</p>}
        {inputErrors.upload && <p className="text-red-600">{inputErrors.upload}</p>}
        {inputErrors.chunkSize && <p className="text-red-600">{inputErrors.chunkSize}</p>}
        {inputErrors.chunkOverlap && <p className="text-red-600">{inputErrors.chunkOverlap}</p>}
        {inputErrors.newFileCategory && <p className="text-red-600">{inputErrors.newFileCategory}</p>}
      </form>
      <div className="flex flex-col h-40vh items-center justify-between"></div>      
    </div>
  )
}

export default UploadFile

export const getStaticProps: GetStaticProps = async () => {
  const { namespaces } = await fetchData('namespaces');

  return {
    props: {
      namespaces
    },
    revalidate: 60 * 60 *24 // This is optional. It ensures regeneration of the page after every 24 hour
  }
};