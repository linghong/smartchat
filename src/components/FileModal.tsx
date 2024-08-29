// components/ImageModal.tsx
import React from 'react';
import Image from 'next/image';

import { FileData } from '@/src/types/chat';
import { fileType } from '@/src/utils/fileTypeChecker';
interface FileModalProps {
  fileData: FileData;
  onClose: () => void;
}

const FileModal: React.FC<FileModalProps> = ({ fileData, onClose }) => {
  if (!fileData) return;
  const { base64Content } = fileData;
  return (
    <div
      className="w-full fixed p-10 inset-0 bg-slate-500 bg-opacity-90 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      aria-describedby="Extended view of the uploaded image"
    >
      {fileType(fileData) === 'image' && (
        <Image
          src={base64Content}
          fill
          style={{ objectFit: 'contain' }}
          alt="Expanded view"
          className="p-6 max-w-full max-h-full"
        />
      )}
      {fileType(fileData) === 'pdf' && (
        <embed
          src={base64Content}
          type="application/pdf"
          width="100%"
          height="500px"
        />
      )}
      {fileType(fileData) === 'text' && (
        <iframe src={base64Content} width="100%" height="500px" />
      )}
      <button
        className="absolute top-9 right-9 text-white text-3xl"
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

export default FileModal;
