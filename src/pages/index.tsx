import { useState, useCallback, useEffect, ChangeEvent, Dispatch } from 'react';

import { GetStaticProps } from 'next';

import AIConfigPanel from '@/src/components/AIConfigPanel';
import ChatInput from '@/src/components/ChatInput';
import ChatMessageList from '@/src/components/ChatMessageList';
import Notification from '@/src/components/Notification';

import { modelOptions } from '@/config/modellist';
import { Message, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

import { fetchNamespaces } from '@/src/utils/fetchNamespaces';
import { updateChats, updateChatMessages } from '@/src/utils/sqliteApiClient';

const initialFileCategory: OptionType = { value: 'none', label: 'None' };

const initialMessage: Message = {
  question: '',
  answer: 'Hi, how can I assist you?'
};

interface HomeProps {
  namespaces: string[];
  setNamespacesList: Dispatch<React.SetStateAction<OptionType[]>>;
  chatId: string;
  setChatId: Dispatch<React.SetStateAction<string>>;
  chatHistory: Message[];
  setChatHistory: Dispatch<React.SetStateAction<Message[]>>;
  imageSrcHistory: ImageFile[][];
  setImageSrcHistory: Dispatch<React.SetStateAction<ImageFile[][]>>;
}

const HomePage: React.FC<HomeProps> = ({
  namespaces,
  setNamespacesList,
  chatId,
  setChatId,
  chatHistory,
  setChatHistory,
  imageSrcHistory,
  setImageSrcHistory
}) => {
  // --- State Variables ---
  const [isConfigPanelVisible, setIsConfigPanelVisible] = useState(true);
  const [selectedNamespace, setSelectedNamespace] = useState<OptionType | null>(
    initialFileCategory
  );
  const [selectedModel, setSelectedModel] = useState<OptionType | null>(
    modelOptions[0]
  );
  const [messageSubjectList, setMessageSubjectList] = useState<string[]>([]);
  const [basePrompt, setBasePrompt] = useState('');
  const [isNewChat, setIsNewChat] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state for namespace options
  const fetchedCategoryOptions =
    namespaces.map(ns => ({ value: ns, label: ns })) ?? [];

  // --- Handlers ---
  const handleModelChange = (selectedOption: OptionType | null) => {
    setSelectedModel(selectedOption);
  };

  const handleNamespaceChange = (selectedOption: OptionType | null) => {
    setSelectedNamespace(selectedOption);
  };

  const handleBasePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBasePrompt(e.target.value);
  };

  const fetchChatResponse = useCallback(
    async (
      basePrompt: string,
      question: string,
      imageSrc: ImageFile[],
      selectedModel: OptionType | null,
      namespace: string
    ) => {
      try {
        const response = await fetch('/api/ai/chat', {
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

        if (!response.ok) {
          const errorData = await response.json();
          setError('There is a server-side error. Try it again later.');
          throw new Error(errorData.message || 'Failed to fetch chat response');
        }

        const data = await response.json();

        setChatHistory((prevHistory: Message[]) => [
          ...prevHistory,
          { question: question, answer: data.answer }
        ]);
        setMessageSubjectList(prevList => [...prevList, data.subject]);
        setLoading(false);
        return data;
      } catch (error) {
        console.error('Error fetching chat response:', error);
        setLoading(false);
        setError('Problem fetch response from AI. Try again.');
      }
    },
    [chatHistory, setChatHistory, setMessageSubjectList]
  );

  const handleSubmit = async (question: string, imageSrc: ImageFile[]) => {
    setImageSrcHistory((prevHistory: ImageFile[][]) => [
      ...prevHistory,
      imageSrc
    ]);
    setChatHistory((prevHistory: Message[]) => [
      ...prevHistory,
      { question, answer: '' }
    ]);
    setError(null);
    setLoading(true);

    try {
      const data = await fetchChatResponse(
        basePrompt,
        question,
        imageSrc,
        selectedModel,
        selectedNamespace?.value || 'none'
      );

      if (chatHistory.length === 1 || !chatId) {
        const chat = await updateChats(data.subject, {});
        setChatId(chat.id);
        updateChatMessages(question, data.answer, chat.id, imageSrc);
      } else {
        updateChatMessages(question, data.answer, parseInt(chatId), imageSrc);
      }
    } catch (error) {
      setError(`Error on response from AI model ${selectedModel?.value}`);
      console.error('error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = (id: number) => {
    setImageSrcHistory((prevHistory: ImageFile[][]) => {
      const newHistory = [...prevHistory];
      newHistory[newHistory.length - 1] = [
        ...newHistory[newHistory.length - 1].slice(0, id),
        ...newHistory[newHistory.length - 1].slice(id + 1)
      ];
      return newHistory;
    });
  };

  useEffect(() => {
    setNamespacesList(fetchedCategoryOptions);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset chat history when starting a new chat
  useEffect(() => {
    if (isNewChat) {
      setChatHistory([initialMessage]);
      setImageSrcHistory([[]]); // Reset image history as well
      setIsNewChat(false);
    }
    // eslint-disable-next-line
  }, [isNewChat]);

  return (
    <div className="flex flex-col w-full xs:w-11/12 sm:w-10/12 xl:w-9/12 h-full mx-auto">
      {isConfigPanelVisible && (
        <div className="flex-shrink-0">
          <AIConfigPanel
            selectedModel={selectedModel}
            handleModelChange={handleModelChange}
            selectedNamespace={selectedNamespace}
            handleNamespaceChange={handleNamespaceChange}
            basePrompt={basePrompt}
            handleBasePromptChange={handleBasePromptChange}
            modelOptions={modelOptions}
            fileCategoryOptions={fetchedCategoryOptions}
          />
        </div>
      )}

      <ChatMessageList
        chatHistory={chatHistory}
        loading={loading}
        imageSrcHistory={imageSrcHistory}
        selectedModel={selectedModel}
        handleImageDelete={handleImageDelete}
      />

      <ChatInput
        onSubmit={handleSubmit}
        isVisionModel={!!selectedModel?.vision}
        selectedModel={selectedModel}
        isConfigPanelVisible={isConfigPanelVisible}
        setIsConfigPanelVisible={setIsConfigPanelVisible}
      />

      {error && <Notification type="error" message={error} />}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const namespaces = await fetchNamespaces();

  return {
    props: {
      namespaces
    },
    revalidate: 60 * 60 * 24 // Regenerate the page after every 24 hours
  };
};

export default HomePage;
