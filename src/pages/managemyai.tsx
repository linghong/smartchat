import { FC, ChangeEvent, MouseEvent, useState } from 'react'
import Header from '@/src/components/Header'
import DropDownSelect, { OptionType } from '@/src/components/DropDownSelect'

type ApiResponse = {
  message: string;
  fileName: string;
  error?: string;
}

const options: OptionType[] = [
  { value: 'open-ai', label: 'Open AI embedding' },
];
const fileCategoryOptions: OptionType[] = [
  { value: 'default', label: 'Default' },
  { value: 'new', label: 'Add New Category' },
];

const UploadFile : FC = () => {
  const [selectedFile, setSelectedFile] =useState<File |null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null> (null)
  const [error, setError] = useState<string | null> (null)
  const [showAddNewCategory, setShowAddNewCategory] = useState(false);
  const [selectedModel, setSelectedModel] = useState<OptionType | null>(options[0])

  const handleFileChange= (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if(files && files[0]){
      setSelectedFile(files[0])
    }
  }

  const handleSubmitChange = ( e: ChangeEvent<HTMLInputElement>) => {

  }
  const handleAddCategoryToDropDown = () => {

  }

  const handleCategoryDropDown = (selectedOption: OptionType | null) => {

  }
  const handleModelDropDown = (selectedOption: OptionType | null) => {
    setSelectedModel(selectedOption)
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
            selectedOption={selectedModel} 
            onChange={handleCategoryDropDown}
            options={options}
            label='This File Belongs to:'
          />
          {showAddNewCategory && 
            <>
              <label className="font-bold ml-10 mr-5 my-10 py-1.5">
                Add New Category:
              </label>
              <input 
                type="text"
                name="newFileCategory"
                className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold mr-20 my-10 px-4 py-1.5 border-2 border-stone-400 hover:border-transparent rounded-xl"
                onChange={handleAddCategoryToDropDown}
              />
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
            selectedOption={selectedModel} 
            onChange={handleModelDropDown}
            options={options}
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