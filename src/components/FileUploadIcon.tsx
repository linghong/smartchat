import React, { useRef, ChangeEvent, FC } from 'react';
import { Paperclip } from 'lucide-react';

interface FileUploadIconProps {
  onFileUpload: (file: File) => void;
  isDisabled: boolean;
  accept?: string; // Optional prop to allow for customizable accepted file types
}

const FileUploadIcon: FC<FileUploadIconProps> = ({
  onFileUpload,
  isDisabled,
  accept = 'image/*, .pdf, .html, .xml, .docx, .txt, .yml, .yaml, .tsx, .ts, .js, .cjs, .coffee, .css, .scss, .sass, less, .xsl, .xlsx,  .jsx, .java, .py, .php, .rb, .erb, .rake, .slim, .cpp, .c, .go, .rs, .log, .cjs, .snap, .sh, .md, .csv, .html, .json, .toml, .sh,  .map,  .xml, .lock, .mod, .metal, .sum, .h, .m, .asp, .net, .dll, .cs, .vb, .fs, .config, .resx, .csproj, .sln'
  // not supported:.rtf, .psd, .eps, .pyc, .ppt, .pptx, .icns, .svg, .cu, .icons, .bin, .exe, .env.example, etc.
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger the file input when onKeyDown is fired
  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    onFileUpload(file);
  };

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
        accept={accept}
        aria-label="Upload file"
      />
      <Paperclip
        size={26}
        style={{
          background: '#fafafb',
          cursor: 'pointer',
          color: '#2c2e2f',
          border: 'solid #d7dadf 1px'
        }}
        aria-hidden="true" // Hides the icon from screen readers
      />
    </label>
  );
};

export default FileUploadIcon;
