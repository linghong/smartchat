import React from 'react';

import { FileData } from '@/src/types/chat';

interface FileThumbnailProps {
  fileData: FileData;
}

const FileThumbnail: React.FC<FileThumbnailProps> = ({ fileData }) => {
  return (
    <div className="w-24 h-24 relative group">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-full h-full"
      >
        <g className="fill-gray-100 stroke-gray-700 stroke-2">
          <path d="M20 10 H70 L80 20 V90 H20 Z" />
          <path d="M70 10 V20 H80" className="fill-none" />
        </g>
        <text
          x="50"
          y="55"
          className="text-xs font-sans fill-gray-700"
          textAnchor="middle"
        >
          File
        </text>
        <text
          x="50"
          y="97"
          className="text-[8px] font-sans fill-gray-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          textAnchor="middle"
        >
          {fileData?.name?.length > 20
            ? `${fileData?.name?.substring(0, 17)}...`
            : fileData?.name}
        </text>
      </svg>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
        {fileData?.name}
      </div>
    </div>
  );
};

export default FileThumbnail;
