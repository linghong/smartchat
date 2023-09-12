import { FC, ChangeEvent, MouseEvent, useState } from 'react'
import Header from '@/src/components/Header'
import DropDownSelect, { OptionType } from '@/src/components/DropDownSelect'
import PlusIcon from '@/src/components/PlusIcon'
import { ActionMeta} from 'react-select'

type ApiResponse = {
  message: string;
  fileName: string;
  error?: string;
}

const embeddingModelOptions = [
  { value: 'open-ai', label: 'Open AI embedding' },
];
const defaultFileCategoryOption: OptionType = 
  { value: 'new', label: 'Add New Category' };

const UploadFile : FC = () => {
  const [selectedFile, setSelectedFile] =useState<File |null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null> (null)
  const [error, setError] = useState<string | null> (null)
  const [showAddNewCategory, setShowAddNewCategory] = useState(false);
  const [selectedFileCategory, setSelectedFileCategory] = useState<OptionType>(defaultFileCategoryOption)
  const [selectedEmbeddingModel, setSelectedModel] = useState<OptionType | null>(embeddingModelOptions[0])
  const [fileCategoryOptions, setFileCategoryOptions]= useState<OptionType [] >([defaultFileCategoryOption])

  const handleFileChange= (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if(files && files[0]){
      setSelectedFile(files[0])
    }
  }

  const handleSubmitChange = ( e: ChangeEvent<HTMLInputElement>) => {

  }

  const handleNewCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSelectedFileCategory({ value, label: value})
  } 
   
  const handleAddCategoryToDropDown = () => {
    setFileCategoryOptions([
      ...fileCategoryOptions, 
      selectedFileCategory
    ])
    setShowAddNewCategory(false)
  }

  const handleDropDown = (selectedOption: OptionType | null, actionMeta: ActionMeta<OptionType>) => {
    if (selectedOption === null) return;

    if(actionMeta.name==='embeddingModel'){
      setSelectedModel(selectedOption)
    } else if(actionMeta.name==='fileCategory' &&  selectedOption?.value==='new'){
      setShowAddNewCategory(true)
    } else {
      setShowAddNewCategory(false)
      setSelectedFileCategory(selectedOption)
    }    
  }

  const handlePdfUpload = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsLoading(true);
    setSuccessMessage(null);
    setError(null);
    
    if(selectedFile){
      const formData = new FormData()
      formData.append('file', selectedFile)

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        const data: ApiResponse = await res.json() as ApiResponse

        if (res.ok) {
          setSuccessMessage(`Upload success: ${data.message}`);
        } else {
          setError(`Upload error: ${data.error}`);
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
      <Header pageTitle="Manage My AI" />
      <form className="flex flex-col h-40vh w-40vw p-10 justify-between bg-slate-50 border border-indigo-100">
        <div>
          <label className="font-bold text-base mr-5">
            Upload File:
          </label>  
          <input 
            type="file"
            name="uploadFile" 
            accept=".pdf"
            onChange={handleFileChange}
          />
        </div>
        <div className="flex flex-row">
          <DropDownSelect
            name='fileCategory' 
            selectedOption={selectedFileCategory} 
            onChange={handleDropDown}
            options={fileCategoryOptions}
            label='This File Belongs to:'
          />
          {showAddNewCategory && 
            <>
              <label className="font-bold ml-10 mr-5 my-10 py-1.5">
                New Category:
              </label>
              <input 
                type="text"
                name="newFileCategory"
                className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold my-10 px-4 py-1.5 border-2 border-stone-400 hover:border-transparent rounded-xl"
                onChange={handleNewCategoryChange}
              />  
              <div className="my-10 py-1.5" onClick={handleAddCategoryToDropDown}><PlusIcon /></div> 
            </>
          }       
        </div>         
        <div className="flex justify-start">
          <label className="font-bold mr-5 py-1.5">
            Chunk Size:
          </label>
          <input 
            type="number"
            name="chunkSize"
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold mr-20 py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl"
            onChange={handleSubmitChange}
          />
          <label className="font-bold mr-5 py-1.5">
            Chunk Overlap Size:
          </label>
          <input 
            type="number"
            name="chunkOverlap"
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold mr-20 py-1.5 px-4 border-2 border-stone-400 hover:border-transparent rounded-xl"
            onChange={handleSubmitChange}
          />       
        </div>
        <div className="flex justify-start">
          <DropDownSelect
            name='embeddingModel' 
            selectedOption={selectedEmbeddingModel} 
            onChange={handleDropDown}
            options={embeddingModelOptions}
            label='Embedding Model:'
          /> 
        </div>          
        <div className="flex justify-end">
          <button
            type="button"
            className=  {`bg-transparent hover:bg-blue-500 text-blue-700 font-semibold mr-10 py-3 px-10 border-2 border-stone-400 hover:border-transparent rounded-3xl ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}`}
            onClick={handlePdfUpload}
            disabled={isLoading}
          >
            Upload
          </button>
        </div>         
        {isLoading && <p className="bold">Uploading...</p>}
        {successMessage && <p className="bold text-green-600">{successMessage}</p>}
        {error && <p className='bold text-red-600'>{error}</p>}
      </form>
      <div className="flex flex-col h-40vh items-center justify-between"></div>      
    </div>
  )
}

export default UploadFile