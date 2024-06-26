// components/ImageModal.tsx
import React from 'react';
import Image from 'next/image';

interface ImageModalProps {
  src: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, onClose }) => {
  return (
    <div
      className="w-full fixed p-10 inset-0 bg-slate-500 bg-opacity-90 flex items-center justify-center z-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      aria-describedby="Extended view of the uploaded image"
    >
      <Image
        src={src}
        fill
        style={{ objectFit: 'contain' }}
        alt="Expanded view"
        className="p-6"
      />
      <button
        className="absolute top-5 right-5 text-white text-3xl"
        onClick={e => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close image view"
      >
        &times;
      </button>
    </div>
  );
};

export default ImageModal;
