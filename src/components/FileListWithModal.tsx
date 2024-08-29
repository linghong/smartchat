import { useState, FC } from 'react';
import { RiCloseLargeFill } from 'react-icons/ri';

import FileModal from '@/src/components/FileModal';
import FileThumbnailSelector from '@/src/components/FileThumbnailSelector';

import { FileData } from '@/src/types/chat';

interface FileListWithModalProps {
  fileSrc: FileData[] | undefined;
  handleFileDelete: (index: number) => void;
  isDeleteIconShow?: boolean;
}

const FileListWithModal: FC<FileListWithModalProps> = ({
  fileSrc,
  handleFileDelete,
  isDeleteIconShow = false
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileData | undefined>();

  const openModal = (fileSrc: FileData) => {
    setSelectedFile(fileSrc);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFile(undefined);
  };
  if (!fileSrc || fileSrc.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-row justify-start w-full p-2">
        {fileSrc.map((fileData: FileData, i: number) => (
          <div key={i} className="w-20 h-full mx-2 relative">
            <div
              className="mr-2 p-1 bg-clip-border bg-slate-100 border-2 border-violet-100"
              onClick={() => openModal(fileData)}
              onKeyDown={e => e.key === 'Enter' && openModal(fileData)}
              aria-label={`Click to view larger file ${i + 1}`}
              title={`Thumbnail for uploaded file ${i + 1}`}
              tabIndex={0}
              role="button"
            >
              <FileThumbnailSelector fileData={fileData} />
            </div>
            {isDeleteIconShow && (
              <button
                onClick={() => handleFileDelete(i)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md"
                aria-label={`Delete file ${i + 1}`}
                role="button"
              >
                <RiCloseLargeFill className="text-gray-600" />
              </button>
            )}
          </div>
        ))}
      </div>
      {modalOpen && selectedFile && (
        <FileModal fileData={selectedFile} onClose={closeModal} />
      )}
    </>
  );
};

export default FileListWithModal;
