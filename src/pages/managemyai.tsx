import { FC, ChangeEvent, MouseEvent, useState } from 'react'
import { ActionMeta} from 'react-select'

import Header from '@/src/components/Header'
import DropDownSelect from '@/src/components/DropDownSelect'
import PlusIcon from '@/src/components/PlusIcon'
import { OptionType } from '@/src/types/common'


type ApiResponse = {
  message: string;
  fileName: string;
  error?: string;
}

interface InputData {
  'chunkSize': number,
  'chunkOverlap': number,
  'newFileCategory': string
}
interface DropDownData {
  'fileCategory': {
    value: string;
    label: string;
  };
  'embeddingModel': {
    value: string;
    label: string;
  };
}

const embeddingModelOptions = [
  { value: 'openAI', label: 'Open AI embedding' },
]
const defaultFileCategoryOption = 
  { value: 'new', label: 'Add New Category' }

const UploadFile: FC = () => {
  
  const [selectedFile, setSelectedFile] =useState<File |null>(null)

  const [showAddNewCategory, setShowAddNewCategory] = useState(false)
  const [fileCategoryOptions, setFileCategoryOptions] = useState<OptionType[]>([defaultFileCategoryOption])

  const [selectedInput, setSelectedInput] = useState<InputData>({
    'chunkSize': 800,
    'chunkOverlap': 300,
    'newFileCategory': ''
  })
  const [selectedDropDown, setSelectedDropDown] = useState<DropDownData>({
    'fileCategory': defaultFileCategoryOption,
    'embeddingModel': embeddingModelOptions[0],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null> (null)
  const [error, setError] = useState<string | null> (null)

  const [notification, setNotification] = useState<string | null> (null)

  const handleFileChange= (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if(files && files[0]){
      setSelectedFile(files[0])
    }
  }

  const handleAddCategoryToDropDown = () => {
    const newFileCategory = selectedInput.newFileCategory
    const newCategoryOption = {
      'value': newFileCategory.replace(/\s+/g, '').toLowerCase(),
        'label': newFileCategory
    }

    setFileCategoryOptions(previousOptions => [
      ...previousOptions, newCategoryOption])
      setSelectedDropDown(prevSelected => ({
        ...prevSelected,
        'fileCategory': newCategoryOption
      }))
    setShowAddNewCategory(false)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name
    const value = e.target.value
    setSelectedInput({
      ...selectedInput,
      [name]: value
    })
  }
   
  const handleDropDownChange = (selectedOption: OptionType | null, actionMeta: ActionMeta<OptionType>) => {
    if (selectedOption === null) return;

    if(actionMeta.name === 'embeddingModel'){
      setSelectedDropDown({
        ...selectedDropDown,
        [actionMeta.name]: selectedOption
      })

    } else if(actionMeta.name === 'fileCategory' &&  selectedOption?.value === 'new'){
      setShowAddNewCategory(true)

    } else {
      setShowAddNewCategory(false)
      setSelectedDropDown({
        ...selectedDropDown, 
        'fileCategory': selectedOption
      })
    }    
  }

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsLoading(true);
    setSuccessMessage(null);
    setError(null);

    if(selectedFile){
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('chunkSize', selectedInput.chunkSize.toString());
      formData.append('chunkOverlap', selectedInput.chunkOverlap.toString());
      formData.append('fileCategory', JSON.stringify(selectedDropDown.fileCategory));
      formData.append('embeddingModel', JSON.stringify(selectedDropDown.embeddingModel));

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
  }

  return (
    <div className="flex flex-col items-center">
      <div className="sr-only" aria-live="polite" aria-atomic="true" >
        {notification}
      </div>
      <Header pageTitle="Manage My AI" />
      <form className="flex flex-col h-40vh w-60vw p-10 justify-between bg-slate-50 border border-indigo-100">
        <div>
          <label 
            htmlFor="fileUpload" className="vw-20vw font-bold text-base mr-5">
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
        <div className="flex flex-row">
          <DropDownSelect
            name='fileCategory' 
            selectedOption={selectedDropDown.fileCategory} 
            onChange={handleDropDownChange}
            options={fileCategoryOptions}
            label='This File Belongs to:'
          />
          {showAddNewCategory && 
            <>
              <label htmlFor="newCategoryOption" className="font-bold ml-10 mr-5 my-10 py-1.5">
                New Category:
              </label>
              <input 
                type="text"
                name="newFileCategory"
                className="bg-transparent hover:bg-slate-100 text-stone-700 font-semibold my-10 px-4 py-1.5 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-blue-500 focus:outline-none"
                onChange={handleInputChange}
              />  
              <button 
                className="my-10 py-1.5"
                aria-label="Add New Category" 
                onClick={handleAddCategoryToDropDown}
              >
                <PlusIcon aria-hidden="true" />
              </button> 
            </>
          }       
        </div>         
        <div className="flex justify-start">
          <label htmlFor="chunkSize" className="font-bold mr-5 py-1.5">
            Chunk Size:
          </label>
          <input 
            type="number"
            name="chunkSize"
            value={selectedInput.chunkSize}
            className="bg-transparent hover:bg-slate-100 text-stone-700 font-semibold mr-20 py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-sky-800 focus:outline-none"
            onChange={handleInputChange}
          />
          <label htmlFor="chunkOverlapSize" className="font-bold mr-5 py-1.5">
            Chunk Overlap Size:
          </label>
          <input 
            type="number"
            name="chunkOverlap"
            value={selectedInput.chunkOverlap}
            className="bg-transparent hover:bg-slate-100 text-stone-700 font-semibold mr-20 py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl focus:border-sky-800 focus:outline-none"
            onChange={handleInputChange}
          />       
        </div>
        <div className="flex justify-start">
          <DropDownSelect
            name='embeddingModel' 
            selectedOption={selectedDropDown.embeddingModel} 
            onChange={handleDropDownChange}
            options={embeddingModelOptions}
            label='Embedding Model:'
          /> 
        </div>          
        <div className="flex justify-end">
          <button
            type="submit"
            className=  {`bg-transparent hover:bg-slate-500 text-stone-700 font-semibold mr-10 py-3 px-10 border-2 border-stone-400 hover:border-transparent rounded-3xl focus:border-blue-500 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'hover:text-white'}`}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Upload
          </button>
        </div>         
        {isLoading && <p className="bold" role="status">Uploading...</p>}
        {successMessage && <p className="bold text-green-600" role="status">{successMessage}</p>}
        {error && <p className="bold text-red-600" role="alert">{error}</p>}
      </form>
      <div className="flex flex-col h-40vh items-center justify-between"></div>      
    </div>
  )
}

export default UploadFile