import { useState, FC } from 'react'
import { BsTrash3 } from "react-icons/bs"

import ImageModal from '@/src/components/ImageModal'

interface ImageListWithModalProps {
  imageSrc: string[];
  handleImageDelete: (index: number) => void;
  isDeleteIconShow?: boolean;
}

const ImageListWithModal: FC<ImageListWithModalProps> = ({imageSrc, handleImageDelete, isDeleteIconShow = false}) => {

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const openModal = (imgSrc: string) => {
    setSelectedImage(imgSrc)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  return (
    <>
     <div className="flex flex-row justify-start w-80vw pt-3 px-3">
      {
        imageSrc.map((imgSrc:string, i: number) => (
          <div key = {i} className="w-20 h-full mx-2">
            <div              
              className="mr-2 p-1 bg-clip-border bg-slate-100 border-2 border-violet-100" 
              onClick={()=>openModal(imgSrc)}
              onKeyDown={(e) => e.key==='Enter' && openModal(imgSrc)}
              tabIndex={0}
              role="button"
              aria-label={`Click to view larger image ${i + 1}`}
              title={`Uploaded image thumbnail ${i + 1}`}
            >
              <div 
                className={`bg-no-repeat bg-center bg-contain min-h-[60px] h-full w-full cursor-pointer`} 
                style={{ backgroundImage: imageSrc ? `url(${imgSrc})` : 'none'}}                
              />
            </div>
           {
           isDeleteIconShow  &&  
            <BsTrash3 
              onClick={()=>handleImageDelete(i)}
              className="text-grey-600 cursor-pointer float-right"
              aria-label={`Delete image ${i + 1}`}
              tabIndex={0}
            />
          }
          </div>
        )
      )}
    </div>
    {modalOpen && <ImageModal src={selectedImage} onClose={closeModal} />} 
  </>    
)}

export default ImageListWithModal