import { FC, ChangeEvent, MouseEvent, useState } from 'react'
import Header from '@/src/components/Header'

type ApiResponse = {
  message: string;
  fileName: string;
  error?: string;
}

const UploadFile : FC = () => {
  const [selectedFile, setSelectedFile] =useState<File |null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null> (null)
  const [error, setError] = useState<string | null> (null)

  const handleFileChange= (e: ChangeEvent<HTMLInputElement>) =>{
    const files = e.target.files
    if(files && files[0]){
      setSelectedFile(files[0])
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
    <div className="flex flex-col">
      <Header pageTitle="Manage My AI" />
      <form className="flex flex-col h-80vh items-center justify-between">
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" 
          onClick={handlePdfUpload}
        >
          Upload
        </button>
        {isLoading && <p className="bold">Uploading...</p>}
        {successMessage && <p className="bold text-green-600">{successMessage}</p>}
        {error && <p className='bold text-red-600'>{error}</p>}
      </form>      
    </div>
  )
}

export default UploadFile