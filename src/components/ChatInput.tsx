import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
  FormEvent
} from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { RiScreenshot2Fill } from 'react-icons/ri';

import ArrowButton from '@/src/components/ArrowButton';
import ButtonWithTooltip from '@/src/components/ButtonWithTooltip';
import FileListWithModal from '@/src/components/FileListWithModal';
import FileUploadIcon from '@/src/components/FileUploadIcon';
import Notification from '@/src/components/Notification';
import { useChatContext } from '@/src/context/ChatContext';
import { FileData } from '@/src/types/chat';
import { fileToDataURLBase64 } from '@/src/utils/fileHelper/fileFetchAndConversion';
import { isSupportedImage } from '@/src/utils/fileHelper/mediaValidationHelper';

interface ChatInputProps {
  onSubmit: (question: string, fileSrc: FileData[]) => void;
  isVisionModel: boolean;
}

const SnapshotIcon: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 26 26"
    fill="none"
    stroke="currentColor"
    stroke-width="1"
    stroke-linecap="round"
    stroke-linejoin="round"
    className="lucide lucide-camera"
    width={size}
    height={size}
  >
    <rect
      x="1"
      y="2"
      width="24"
      height="21"
      stroke-dasharray="2 2"
      fill="none"
    />

    <path
      d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
      fill="#5A5C62"
      stroke="black"
    />
    <circle cx="12" cy="13" r="3" fill="white" />
  </svg>
);

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isVisionModel }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedModel, isConfigPanelVisible, setIsConfigPanelVisible } =
    useChatContext();

  const [userInput, setUserInput] = useState('');
  const [rows, setRows] = useState<number>(1);
  const [fileSrc, setFileSrc] = useState<FileData[]>([]);
  const [fileError, setFileError] = useState<string[]>([]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement> | KeyboardEvent) => {
      e.preventDefault();
      const question: string = userInput.trim();

      if (question.length === 0 && fileSrc.length === 0) return;

      onSubmit(question, fileSrc);

      setUserInput('');
      setFileSrc([]);

      // Reset the textarea rows to initial state
      setRows(1);

      // Reset the textarea height
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    },
    [fileSrc, userInput, onSubmit]
  );

  const handleImageFile = async (fileData: FileData) => {
    if (!isVisionModel) {
      setFileError(prev => [...prev, 'The model only supports text messages.']);
      return;
    }

    const imageValidationError = isSupportedImage(
      selectedModel?.value || '',
      fileData
    );
    if (imageValidationError.length !== 0) {
      setFileError(prev => [...prev, ...imageValidationError]);
      return;
    }

    setFileSrc(prev => [...prev, fileData]);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    try {
      const base64Content = await fileToDataURLBase64(file);
      if (!base64Content) {
        setFileError(prev => [
          ...prev,
          'Error happened when extracting file data'
        ]);
        return;
      }
      const fileType = file.type
        ? file.type
        : base64Content.slice(5).split(';')[0];

      const fileData: FileData = {
        base64Content: DOMPurify.sanitize(base64Content),
        type: fileType,
        size: file.size,
        name: file.name
      };

      if (fileType.startsWith('image/')) {
        await handleImageFile(fileData);
      } else {
        setFileSrc(prev => [...prev, fileData]);
      }
    } catch (error) {
      console.error('Error:', error);
      setFileError(prev => [
        ...prev,
        'Error happened when extracting file data'
      ]);
    }
  };
  const handleScreenCapture = async () => {
    try {
      const response = await fetch('/api/tools/screenshot', { method: 'POST' });
      const { message, base64Image, type, size, name } = await response.json();

      if (!response.ok) {
        setFileError(prev => [
          ...prev,
          'An error occurred while capturing the screen'
        ]);
        return;
      }
      const newImage: FileData = {
        base64Content: base64Image,
        type,
        size,
        name
      };

      const imageValidationError = isSupportedImage(
        selectedModel?.value || '',
        newImage
      );
      if (imageValidationError.length !== 0) {
        setFileError(prev => [...prev, ...imageValidationError]);
        return;
      }

      setFileSrc([...fileSrc, newImage]);
    } catch (error) {
      console.error('Error:', error);
      setFileError(prev => [
        ...prev,
        'A network error occurred while capturing the screen'
      ]);
    }
  };

  const handleFileDelete = (id: number) => {
    setFileSrc(prevFiles => prevFiles.filter((_, index) => index !== id));
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    setUserInput(newValue);

    // Close config panel when user starts typing
    if (newValue.length >= 0 && isConfigPanelVisible) {
      setIsConfigPanelVisible(false);
    }

    //when copying a paragraph
    const newRows = e.target.value.match(/\n/g)?.length ?? 0;
    setRows(Math.min(newRows + 1, 8));

    // automatically adjust the height of the textarea as the user types
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  // for Shift + Enter
  useEffect(() => {
    const handleShiftEnter = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();

      if (e.shiftKey) {
        const start = textAreaRef.current?.selectionStart;
        const end = textAreaRef.current?.selectionEnd;

        if (start !== undefined && end !== undefined && textAreaRef.current) {
          const value = textAreaRef.current.value;
          const newValue =
            value.substring(0, start) + '\n' + value.substring(end);
          setUserInput(newValue);
          setRows(rows => Math.min(rows + 1, 8));

          // Update cursor position
          setTimeout(() => {
            if (textAreaRef.current) {
              textAreaRef.current.selectionStart =
                textAreaRef.current.selectionEnd = start + 1;
            }
          }, 0);
        }
      } else {
        handleSubmit(e);
      }
    };

    const currentTextArea = textAreaRef.current;
    if (currentTextArea) {
      currentTextArea.addEventListener('keydown', handleShiftEnter);
    }

    return () => {
      if (currentTextArea) {
        currentTextArea.removeEventListener('keydown', handleShiftEnter);
      }
    };
  }, [handleSubmit]);

  const isFileUploadIconDisabled =
    !selectedModel.contextWindow || selectedModel.contextWindow <= 4000;

  return (
    <div className="flex flex-col w-full justify-around flex-shrink-0 items-center  my-1">
      {fileSrc.length > 0 && (
        <FileListWithModal
          fileSrc={fileSrc}
          handleFileDelete={handleFileDelete}
          isDeleteIconShow={true}
        />
      )}
      <div className="flex w-full justify-around items-center border-2 border-indigo-300 bg-indigo-200 bg-opacity-30 rounded-lg">
        <div className="flex w-3/12 ms:w-2/12 sm:w-1/12 items-center justify-around md:mx-1">
          <ButtonWithTooltip
            icon={<SnapshotIcon size={28} aria-hidden="true" />}
            onClick={handleScreenCapture}
            ariaLabel="Capture Screenshot"
            tooltipText="Capture Screenshot"
            isDisabled={!isVisionModel}
            tooltipDisabledText={`${selectedModel?.value} does not have vision feature`}
          />
          <ButtonWithTooltip
            icon={
              <FileUploadIcon
                onFileUpload={handleFileUpload}
                isDisabled={isFileUploadIconDisabled}
              />
            }
            onClick={() => {}}
            ariaLabel="Upload File"
            tooltipText="Upload File"
            isDisabled={isFileUploadIconDisabled}
            tooltipDisabledText={`${selectedModel?.value}'s context window is too small to add a file`}
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center w-8/12 ms:w-9/12 xs:w-10/12 xl:w-11/12 px-2 py-1 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring focus:ring-stone-300 focus:ring-offset-red"
        >
          <textarea
            ref={textAreaRef}
            autoFocus={false}
            spellCheck="true"
            rows={rows}
            id="userInput"
            name="userInput"
            className="w-full max-h-96 placeholder-gray-400 overflow-y-auto p-3 focus:ring-stone-100 focus:outline-none"
            placeholder="Click to send. Shift + Enter for a new line."
            value={`${userInput}`}
            onChange={handleInputChange}
            aria-label="Enter your message here"
          />
          <ArrowButton
            disabled={userInput === '' && fileSrc.length === 0}
            aria-label="Send message"
          />
        </form>
      </div>
      {fileError &&
        fileError.map((err, i) => (
          <Notification key={i} type="error" message={err} />
        ))}
    </div>
  );
};

export default ChatInput;
