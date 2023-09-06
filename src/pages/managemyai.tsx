import { FC, ChangeEvent } from 'react'
import Header from '@/src/components/Header'

const UploadFile : FC = () => {
  const handlePdfUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]){
      const file = e.target.files[0]
      console.log('pdf Upload')
    }
  }
  
  return (
    <div className="flex flex-col">
      <Header pageTitle="Manage My AI" />
      <div className="flex flex-col h-80vh items-center justify-between">
        <input type="file" accept=".pdf" onChange={handlePdfUpload} />
      </div>
    </div>
  )
}

export default UploadFile