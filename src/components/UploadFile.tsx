import { FC, ChangeEvent, Dispatch, SetStateAction } from 'react'

interface UploadProps {
  label: string;
  uploadError: string | null;
  setUploadError: Dispatch<SetStateAction<string | null>>;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;
  fileType: string;
}

const UploadFile: FC<UploadProps> = ({ label, fileType, uploadError, setUploadError, setSelectedFile }) => {

  const handleFileChange= (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if(!files) {
      setUploadError("You must load a file.")
      return
    }
    const file = files[0]
    if(file){
      //calculate file size with unit MB
      const fileSize = (file.size/(1024*1024))
      if(fileSize > 200) {
        setUploadError("Maxmium file size to upload is 200MB.")
        return
      }
      setSelectedFile(files[0])
      if(uploadError) setUploadError(null)
    }
  }
  return (
    <div className="my-2">
      <label 
        htmlFor="fileUpload" className="w-50 font-bold text-base mr-5">
        {label}
      </label>  
      <input 
          type="file"
          name="uploadFile" 
          accept={fileType}
          onChange={handleFileChange}
          className="focus:border-blue-500 focus:outline-none"
      />
    </div>
  )
}

export  default UploadFile