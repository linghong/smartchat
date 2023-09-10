import { FC, ChangeEvent, MouseEvent, useState } from 'react'
import Header from '@/src/components/Header'

type ApiResponse = {
  message: string;
  fileName: string;
  error?: string;
}

const UploadFile : FC = () => {
  const [selectedFile, setSelectedFile] =useState<File |null>(null)

  const handleFileChange= (e: ChangeEvent<HTMLInputElement>) =>{
    const files = e.target.files
    if(files && files[0]){
      setSelectedFile(files[0])
    }
  }

  const handlePdfUpload = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

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
          console.log('Upload success:', data);
        } else {
          console.error('Upload error:', data.error);
        }

      } catch (error) {
        console.error('There was a network error when sending file:', error)
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
      </form>      
    </div>
  )
}

export default UploadFile