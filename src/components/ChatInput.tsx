import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
  FormEvent,
  Dispatch,
  SetStateAction
} from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { RiScreenshot2Fill } from 'react-icons/ri';

import { FileData } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

import ArrowButton from '@/src/components/ArrowButton';
import ButtonWithTooltip from '@/src/components/ButtonWithTooltip';
import FileUploadIcon from '@/src/components/FileUploadIcon';

import FileListWithModal from '@/src/components/FileListWithModal';
import Notification from '@/src/components/Notification';

import {
  fileToDataURLBase64,
  fileToArrayBufferBase64
} from '@/src/utils/fileFetchAndConversion';
import { isSupportedImage } from '@/src/utils/mediaValidationHelper';

interface ChatInputProps {
  onSubmit: (question: string, fileSrc: FileData[]) => void;
  isVisionModel: boolean;
  selectedModel: OptionType;
  isConfigPanelVisible: boolean;
  setIsConfigPanelVisible: Dispatch<SetStateAction<boolean>>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  isVisionModel,
  selectedModel,
  isConfigPanelVisible,
  setIsConfigPanelVisible
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
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
      setFileError([...fileError, 'The model only supports text message.']);
      return;
    }
    try {
      const imageVadiationError = isSupportedImage(
        selectedModel?.value || '',
        fileData
      );
      if (imageVadiationError.length !== 0) {
        setFileError([...fileError, ...imageVadiationError]);
        return;
      }

      setFileSrc([...fileSrc, fileData]);
    } catch {
      setFileError([...fileError, 'Failed to read the image file']);
      throw new Error('Failed to read the image file.');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const base64Content = await fileToDataURLBase64(file);
    if (!base64Content) {
      setFileError([...fileError, 'Error happened when extracting file data']);
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
      setFileSrc([...fileSrc, fileData]);
    }
  };

  const handleScreenCapture = async () => {
    try {
      const response = await fetch('/api/tools/screenshot', { method: 'POST' });
      const { message, base64Image, type, size, name } = await response.json();

      if (!response.ok) {
        alert(message);
        return;
      }
      const newImage: FileData = {
        base64Content: base64Image,
        type,
        size,
        name
      };

      const imageVadiationError = isSupportedImage(
        selectedModel?.value || '',
        newImage
      );
      if (imageVadiationError.length !== 0) {
        setFileError([...fileError, ...imageVadiationError]);
        return;
      }

      setFileSrc([...fileSrc, newImage]);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while capturing the screen');
    }
  };

  const handleFileDelete = (id: number) => {
    setFileSrc(prevFiles => prevFiles.filter((_, index) => index !== id));
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    setUserInput(DOMPurify.sanitize(newValue));

    // Close config panel when user starts typing
    if (newValue.length >= 1 && isConfigPanelVisible) {
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

  // useEffect for Shift + Enter
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
          setRows(rows => rows + 1);

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
        <div className="flex w-3/12 ms:w-2/12  sm:w-1/12 items-center justify-around md:mx-1">
          <ButtonWithTooltip
            icon={<RiScreenshot2Fill size={30} />}
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
                isDisabled={!isVisionModel}
              />
            }
            onClick={() => {}}
            ariaLabel="Upload File"
            tooltipText="Upload File"
            isDisabled={!isVisionModel}
            tooltipDisabledText={`${selectedModel?.value} does not have vision feature`}
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
            className="w-full max-h-96 placeholder-gray-400 overflow-y-auto focus: p-3 focus:ring-stone-100 focus:outline-none"
            placeholder="Click to send. Shift + Enter for a new line."
            value={userInput}
            onChange={handleInputChange}
            aria-label="Enter your message here"
          />
          <ArrowButton
            disabled={userInput === '' && fileSrc.length === 0}
            aria-label="Send"
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
