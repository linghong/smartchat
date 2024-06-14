import { FC, ChangeEvent, Dispatch, SetStateAction } from 'react'

import { UploadData, UploadErrors } from '@/src/types/common'
interface UploadProps {
  label: string
  uploadErrors: UploadErrors
  name: string
  setUploadErrors: Dispatch<SetStateAction<UploadErrors>>
  setSelectedUpload: Dispatch<SetStateAction<UploadData>>
  fileType: string
}

const UploadFile: FC<UploadProps> = ({
  label,
  fileType,
  name,
  uploadErrors,
  setUploadErrors,
  setSelectedUpload,
}) => {
  const handleUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) {
      throw new Error('Error: Upload Files array becomes null or undefined')
    }
    const file = files[0]
    if (file) {
      const fileSize = file.size / (1024 * 1024)
      if (fileSize > 1000) {
        setUploadErrors(prev => ({
          ...prev,
          [name]: 'Maxmium file size to upload is 1GB.',
        }))
        return
      }
      setSelectedUpload(prev => ({ ...prev, [name]: files[0] }))
      if (uploadErrors)
        setUploadErrors(prev => ({
          ...prev,
          [name]: null,
        }))
    }
  }
  return (
    <div className="my-2">
      <label htmlFor="fileUpload" className="w-50 font-bold text-base mr-5">
        {label}
      </label>
      <input
        id="fileUpload"
        type="file"
        name={name}
        data-testid="fileInput"
        accept={fileType}
        onChange={handleUploadChange}
        className="focus:border-blue-500 focus:outline-none"
      />
    </div>
  )
}

export default UploadFile
