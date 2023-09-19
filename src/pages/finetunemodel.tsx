import { FC, MouseEvent, useState } from 'react'

import Header from '@/src/components/Header'
import UploadFile from '@/src/components/UploadFile'
import { ApiResponse } from '@/src/types/common'

const FinetuneModel: FC = () => {

  const [selectedFile, setSelectedFile] =useState<File | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null> (null)
  const [error, setError] = useState<string | null> (null)
  const [uploadError, setUploadError] = useState< string | null>(null);

  const [notification, setNotification] = useState<string | null> (null)

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if(!selectedFile) {
      setUploadError('You must upload a file.')
      return
    }
  
    if(uploadError) return

    setIsLoading(true);
    setSuccessMessage(null);
    setError(null);

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch('/api/finetune', {
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
      <Header pageTitle="Finetune AI Model" />
      <form className="flex flex-col h-60vh lg:h-40vh p-10 justify-between bg-slate-50 border border-indigo-100">
        <UploadFile 
          label="Upload Training Data: "
          fileType=".csv, .xls, .xlsx, .json, .jsonl"
          uploadError={uploadError}
          setUploadError={setUploadError}
          setSelectedFile={setSelectedFile}
        />         
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
      </form>
      <div className="flex flex-col h-40vh items-center justify-between"></div>      
    </div>
  )
}

export default FinetuneModel

