import React, { useRef, ChangeEvent, FC } from 'react'
import { BsImageFill } from 'react-icons/bs'
interface ImageUploadIconProps {
  onImageUpload: (file: File) => void
  isDisabled: boolean
}

const ImageUploadIcon: FC<ImageUploadIconProps> = ({
  onImageUpload,
  isDisabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Trigger the file input when onKeyDown is fired
  const handleIconClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return
    const file = event.target.files ? event.target.files[0] : null
    if (file) {
      onImageUpload(file)
    }
  }

  return (
    <label
      className="flex items-center justify-center  text-white font-bold px-2 rounded cursor-pointer"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleIconClick()}
    >
      <input
        type={`${isDisabled ? 'none' : 'file'}`}
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
        aria-label="Upload image"
      />
      <BsImageFill
        size={24}
        style={{
          cursor: 'pointer',
          background: '#7b7bdc',
          border: 'solid black 1px',
        }}
        aria-hidden="true" // Hides the icon from screen readers
      />
    </label>
  )
}

export default ImageUploadIcon
