import { FC } from 'react';

import FileThumbnail from '@/src/components/FileThumbnail';
import { FileData } from '@/src/types/chat';
import { fileType } from '@/src/utils/fileTypeChecker';

const FileThumbnailSelector: FC<{ fileData: FileData }> = ({ fileData }) => {
  return (
    <>
      {fileType(fileData) === 'image' && (
        <div
          className={`bg-no-repeat bg-center bg-contain min-h-[60px] h-full w-full cursor-pointer`}
          style={{
            backgroundImage: fileData
              ? `url(${fileData.base64Content})`
              : 'none'
          }}
        />
      )}
      {fileType(fileData) === 'pdf' && (
        <div
          className={`bg-no-repeat bg-center bg-contain min-h-[60px] h-full w-full cursor-pointer`}
        >
          <embed
            src={fileData.base64Content}
            type="application/pdf"
            width="100%"
            height="h-full"
          />
        </div>
      )}
      {fileType(fileData) === 'text' && (
        <div
          className={`bg-no-repeat bg-center bg-contain min-h-[60px] h-full w-full cursor-pointer`}
        >
          <iframe src={fileData.base64Content} width="100%" height="h-full" />
        </div>
      )}
      {fileType(fileData) !== 'image' &&
        fileType(fileData) !== 'pdf' &&
        fileType(fileData) !== 'text' && <FileThumbnail fileData={fileData} />}
    </>
  );
};

export default FileThumbnailSelector;
