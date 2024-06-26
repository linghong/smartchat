import {
  useState,
  useRef,
  useCallback,
  useEffect,
  ChangeEvent,
  FormEvent,
  FC
} from 'react';
import { GetStaticProps } from 'next';
import { RiScreenshot2Fill } from 'react-icons/ri'; //screenshot

import { modelOptions } from '@/config/modellist';
import AIConfigPanel from '@/src/components/AIConfigPanel';
import ArrowButton from '@/src/components/ArrowButton';
import ButtonWithTooltip from '@/src/components/ButtonWithTooltip';
import ChatMessage from '@/src/components/ChatMessage';
import DropdownSelect from '@/src/components/DropdownSelect';
import ImageListWithModal from '@/src/components/ImageListWithModal';
import ImageUploadIcon from '@/src/components/ImageUploadIcon';
import Notification from '@/src/components/Notification';
import { Message, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { fetchNamespaces } from '@/src/utils/fetchNamespaces';
import { fileToBase64 } from '@/src/utils/fileFetchAndConversion';
import { isSupportedImage } from '@/src/utils/mediaValidationHelper';

interface HomeProps {
  namespaces: string[];
  isNewChat: boolean;
  isPanelVisible: boolean;
  setIsNewChat: (value: boolean) => void;
  messageSubjectList: string[];
  setMessageSubjectList: (messageSubjectList: string[]) => void;
}

const initialFileCategory: OptionType = { value: 'none', label: 'None' };

const initialMessage = {
  question: '',
  answer: 'Hi, how can I assist you?'
};

const HomePage: FC<HomeProps> = ({
  namespaces,
  isNewChat,
  setIsNewChat,
  messageSubjectList,
  setMessageSubjectList,
  isPanelVisible
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const fileCategoryOptions =
    namespaces.length === 0
      ? [initialFileCategory]
      : [
          initialFileCategory,
          ...namespaces.map(ns => ({ value: ns, label: ns }))
        ];
  const [selectedNamespace, setSelectedNamespace] = useState<OptionType | null>(
    initialFileCategory
  );

  const [selectedModel, setSelectedModel] = useState<OptionType | null>(
    modelOptions[0]
  );
  const [basePrompt, setBasePrompt] = useState('');

  const [userInput, setUserInput] = useState<string>('');
  const [rows, setRows] = useState<number>(1);
  const [chatHistory, setChatHistory] = useState<Message[]>([initialMessage]);

  const [imageSrc, setImageSrc] = useState<ImageFile[]>([]);
  const [imageSrcHistory, setImageSrcHistory] = useState<ImageFile[][]>([[]]);
  const [isVisionModel, setIsVisionModel] = useState(true);
  const [imageError, setImageError] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChatResponse = useCallback(
    async (
      basePrompt: string,
      question: string,
      imageSrc: ImageFile[],
      selectedModel: OptionType | null,
      namespace: string
    ) => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            basePrompt,
            question,
            imageSrc,
            chatHistory,
            namespace,
            selectedModel
          })
        });

        //handling server-side errors
        if (!response.ok) {
          const errorData = await response.json();

          setError('There is a server side error. Try it again later.');
          setLoading(false);
          return;
        }

        const data = await response.json();

        setChatHistory([
          ...chatHistory.slice(0, chatHistory.length),
          { question: userInput, answer: data.answer }
        ]);

        setMessageSubjectList([...messageSubjectList, data.subject]);

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(
          'An error occurred while fetching the data. Please try again.'
        );
        console.error('error', error);
      }
    },
    [userInput, chatHistory, messageSubjectList, setMessageSubjectList]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const question: string = userInput.trim();

      // prevent form submission if nothing is entered
      if (question.length === 0 && imageSrc.length === 0) return;

      setImageSrcHistory(prev => [...prev, imageSrc]);

      setChatHistory(prev => [...prev, { question: userInput, answer: '' }]);

      setError(null);
      setLoading(true);
      setUserInput('');
      setImageSrc([]);
      setRows(1); // Reset the textarea rows to initial state

      fetchChatResponse(
        basePrompt,
        question,
        imageSrc,
        selectedModel,
        selectedNamespace?.value || 'none'
      );
    },
    [
      basePrompt,
      userInput,
      imageSrc,
      fetchChatResponse,
      selectedModel,
      selectedNamespace?.value
    ]
  );

  const handleModelChange = (selectedOption: OptionType | null) => {
    setIsVisionModel(!!selectedOption?.vision);
    setSelectedModel(selectedOption);
  };

  const handleNamespaceChange = (selectedOption: OptionType | null) => {
    setSelectedNamespace(selectedOption);
  };

  const handleBasePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const basePrompt = e.target.value;
    setBasePrompt(basePrompt);
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setUserInput(newValue);
    const newRows = newValue.match(/\n/g)?.length ?? 0;
    setRows(newRows + 1);
  };

  const handleImageUpload = async (file: File) => {
    if (!isVisionModel) return;
    if (!file) return;

    try {
      const base64Image = await fileToBase64(file);
      const newImage = {
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

  const handleImageDelete = (id: number) => {
    setImageSrc([...imageSrc.slice(0, id), ...imageSrc.slice(id + 1)]);
  };

  const handleScreenCapture = async () => {
    try {
      const response = await fetch('/api/screenshot', { method: 'POST' });
      const { message, base64Image, mimeType, size, name } =
        await response.json();

      if (!response.ok) {
        alert(message);
        return;
      }

      const newImage = { message, base64Image, mimeType, size, name };

      //Image mimeType and size validation
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

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();

      //insert newline \n when using shift + enter
      if (e.shiftKey) {
        setUserInput(prevState => prevState + '\n');
        setRows(rows => rows + 1);
      } else {
        handleSubmit(e as any);
        setRows(1);
      }
    };
    const currentTextArea = textAreaRef.current;
    if (currentTextArea) {
      currentTextArea.addEventListener('keydown', keyDownHandler);
      currentTextArea.scrollTop = currentTextArea.scrollHeight;
    }

    return () => {
      if (currentTextArea) {
        currentTextArea.removeEventListener('keydown', keyDownHandler);
      }
    };
  }, [handleSubmit]);

  useEffect(() => {
    if (messagesRef.current !== null) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (isNewChat) {
      setChatHistory([initialMessage]);
      setIsNewChat(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewChat]);

  return (
    <div className="flex flex-col w-full xs:w-11/12 sm:w-10/12 xl:w-9/12 flex-grow mx-auto mt-2">
      {isPanelVisible && (
        <AIConfigPanel
          selectedModel={selectedModel}
          handleModelChange={handleModelChange}
          selectedNamespace={selectedNamespace}
          handleNamespaceChange={handleNamespaceChange}
          basePrompt={basePrompt}
          handleBasePromptChange={handleBasePromptChange}
          modelOptions={modelOptions}
          fileCategoryOptions={fileCategoryOptions}
          isPanelVisible={isPanelVisible}
        />
      )}
      <div className="flex flex-col flex-grow w-full">
        <div className="flex flex-col h-[calc(100vh-440px) md:h-[calc(100vh-430px)] lg:h-[calc(100vh-400px)] w-full items-center">
          <div
            className={`w-full bg-white border-2 border-stone-200 overflow-y-auto`}
          >
            <div
              className="w-full h-full overflow-y-auto rounded-lg"
              aria-live="polite"
              aria-atomic="true"
              ref={messagesRef}
            >
              {chatHistory.map((chat, index) => (
                <div key={index}>
                  <ChatMessage
                    index={index}
                    message={chat}
                    lastIndex={index === chatHistory.length - 1 ? true : false}
                    loading={loading}
                    imageSrc={imageSrcHistory[index]}
                    modelName={selectedModel?.label || 'GPT-4o'}
                    handleImageDelete={handleImageDelete}
                  />
                </div>
              ))}
            </div>
          </div>
          {imageSrc.length > 0 && (
            <ImageListWithModal
              imageSrc={imageSrc}
              handleImageDelete={handleImageDelete}
              isDeleteIconShow={true}
            />
          )}
        </div>
      </div>
      <div className="flex w-full justify-around items-center  my-1 border-2 border-indigo-300 bg-indigo-200 bg-opacity-30 rounded-lg">
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
            disabled={loading}
            autoFocus={false}
            rows={rows}
            id="userInput"
            name="userInput"
            className={`w-full max-h-96 placeholder-gray-400 overflow-y-auto focus: p-3 ${loading && 'opacity-50'} focus:ring-stone-100 focus:outline-none`}
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
      {error && <Notification type="error" message={error} />}
      {imageError &&
        imageError.map((err, i) => (
          <Notification key={i} type="error" message={err} />
        ))}
    </div>
  );
};
export default HomePage;

export const getStaticProps: GetStaticProps = async () => {
  const namespaces = await fetchNamespaces();

  return {
    props: {
      namespaces
    },
    revalidate: 60 * 60 * 24 // Regenerate the page after every 24 hours
  };
};
