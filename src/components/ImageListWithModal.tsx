import { useState, FC } from 'react';
import { RiCloseLargeFill } from 'react-icons/ri';

import ImageModal from '@/src/components/ImageModal';
import { ImageFile } from '@/src/types/chat';

interface ImageListWithModalProps {
  imageSrc: ImageFile[];
  handleImageDelete: (index: number) => void;
  isDeleteIconShow?: boolean;
}

const ImageListWithModal: FC<ImageListWithModalProps> = ({
  imageSrc,
  handleImageDelete,
  isDeleteIconShow = false
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const openModal = (imgSrc: string) => {
    setSelectedImage(imgSrc);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-row justify-start w-full pt-3 px-3">
        {imageSrc.map((imgSrc: ImageFile, i: number) => (
          <div key={i} className="w-20 h-full mx-2 relative">
            <div
              className="mr-2 p-1 bg-clip-border bg-slate-100 border-2 border-violet-100"
              onClick={() => openModal(imgSrc.base64Image)}
              onKeyDown={e =>
                e.key === 'Enter' && openModal(imgSrc.base64Image)
              }
              tabIndex={0}
              role="button"
              aria-label={`Click to view larger image ${i + 1}`}
              title={`Uploaded image thumbnail ${i + 1}`}
            >
              <div
                className={`bg-no-repeat bg-center bg-contain min-h-[60px] h-full w-full cursor-pointer`}
                style={{
                  backgroundImage: imageSrc
                    ? `url(${imgSrc.base64Image})`
                    : 'none'
                }}
              />
            </div>
            {isDeleteIconShow && (
              <button
                onClick={() => handleImageDelete(i)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md"
                aria-label={`Delete image ${i + 1}`}
              >
                <RiCloseLargeFill className="text-gray-600" />
              </button>
            )}
          </div>
        ))}
      </div>
      {modalOpen && <ImageModal src={selectedImage} onClose={closeModal} />}
    </>
  );
};

export default ImageListWithModal;
