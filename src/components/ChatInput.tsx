import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
  FormEvent,
  Dispatch
} from 'react';
import { RiScreenshot2Fill } from 'react-icons/ri';

import { ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

import ArrowButton from '@/src/components/ArrowButton';
import ButtonWithTooltip from '@/src/components/ButtonWithTooltip';
import ImageUploadIcon from '@/src/components/ImageUploadIcon';
import ImageListWithModal from '@/src/components/ImageListWithModal';
import Notification from '@/src/components/Notification';

import { fileToBase64 } from '@/src/utils/fileFetchAndConversion';
import { isSupportedImage } from '@/src/utils/mediaValidationHelper';

interface ChatInputProps {
  onSubmit: (question: string, imageSrc: ImageFile[]) => void;
  isVisionModel: boolean;
  selectedModel: OptionType | null;
  isConfigPanelVisible: boolean;
  setIsConfigPanelVisible: Dispatch<React.SetStateAction<boolean>>;
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
  const [imageSrc, setImageSrc] = useState<ImageFile[]>([]);
  const [imageError, setImageError] = useState<string[]>([]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement> | KeyboardEvent) => {
      e.preventDefault();
      const question: string = userInput.trim();

      if (question.length === 0 && imageSrc.length === 0) return;

      onSubmit(question, imageSrc);

      setUserInput('');
      setImageSrc([]);

      // Reset the textarea rows to initial state
      setRows(1);

      // Reset the textarea height
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    },
    [imageSrc, userInput, onSubmit]
  );

  const handleImageUpload = async (file: File) => {
    if (!isVisionModel) return;
    if (!file) return;

    try {
      const base64Image = await fileToBase64(file);
      const newImage: ImageFile = {
        base64Image,
        mimeType: file.type,
        size: file.size,
        name: file.name
      };

      const imageVadiationError = isSupportedImage(
        selectedModel?.value || '',
        newImage
      );
      if (imageVadiationError.length !== 0) {
        setImageError([...imageError, ...imageVadiationError]);
        return;
      }

      setImageSrc([...imageSrc, newImage]);
    } catch {
      throw new Error('Failed to read the file.');
    }
  };

  const handleScreenCapture = async () => {
    try {
      const response = await fetch('/api/tools/screenshot', { method: 'POST' });
      const { message, base64Image, mimeType, size, name } =
        await response.json();

      if (!response.ok) {
        alert(message);
        return;
      }
      const newImage: ImageFile = {
        base64Image,
        mimeType,
        size,
        name
      };

      const imageVadiationError = isSupportedImage(
        selectedModel?.value || '',
        newImage
      );
      if (imageVadiationError.length !== 0) {
        setImageError([...imageError, ...imageVadiationError]);
        return;
      }

      setImageSrc([...imageSrc, newImage]);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while capturing the screen');
    }
  };

  const handleImageDelete = (id: number) => {
    setImageSrc(prevImages => prevImages.filter((_, index) => index !== id));
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setUserInput(newValue);

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
      {imageSrc.length > 0 && (
        <ImageListWithModal
          imageSrc={imageSrc}
          handleImageDelete={handleImageDelete}
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
              <ImageUploadIcon
                onImageUpload={handleImageUpload}
                isDisabled={!isVisionModel}
              />
            }
            onClick={() => {}}
            ariaLabel="Upload Image"
            tooltipText="Upload Image"
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
            disabled={userInput === '' && imageSrc.length === 0}
            aria-label="Send"
          />
        </form>
      </div>
      {imageError &&
        imageError.map((err, i) => (
          <Notification key={i} type="error" message={err} />
        ))}
    </div>
  );
};

export default ChatInput;
