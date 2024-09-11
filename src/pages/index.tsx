import {
  useState,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction
} from 'react';

import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { SingleValue } from 'react-select';

import AIConfigPanel from '@/src/components/AIConfigPanel';
import ChatInput from '@/src/components/ChatInput';
import ChatMessageList from '@/src/components/ChatMessageList';
import Modal from '@/src/components/Modal';
import Notification from '@/src/components/Notification';
import WithAuth from '@/src/components/WithAuth';

import { modelOptions } from '@/config/modellist';
import { Message, FileData, AIConfig } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { fetchNamespaces } from '@/src/utils/fetchNamespaces';
import { initialMessage, defaultModel } from '@/src/utils/initialData';
import { updateChats } from '@/src/utils/sqliteChatApiClient';
import { updateChatMessages } from '@/src/utils/sqliteChatIdApiClient';

const initialFileCategory: OptionType = { value: 'none', label: 'None' };

interface HomeProps {
  namespaces: string[];
  setNamespacesList: Dispatch<SetStateAction<OptionType[]>>;
  selectedModel: OptionType;
  setSelectedModel: Dispatch<SetStateAction<OptionType | null>>;
  chatId: string;
  setChatId: Dispatch<SetStateAction<string>>;
  setChats: Dispatch<SetStateAction<OptionType[]>>;
  chatHistory: Message[];
  setChatHistory: Dispatch<SetStateAction<Message[]>>;
  fileSrcHistory: FileData[][];
  setFileSrcHistory: Dispatch<SetStateAction<FileData[][]>>;
  isConfigPanelVisible: boolean;
  setIsConfigPanelVisible: Dispatch<SetStateAction<boolean>>;
}

const HomePage: React.FC<HomeProps> = ({
  namespaces,
  setNamespacesList,
  selectedModel,
  setSelectedModel,
  chatId,
  setChatId,
  setChats,
  chatHistory,
  setChatHistory,
  fileSrcHistory,
  setFileSrcHistory,
  isConfigPanelVisible,
  setIsConfigPanelVisible
}) => {
  const router = useRouter();

  // Derived state for namespace options
  const fetchedCategoryOptions =
    namespaces.map(ns => ({ value: ns, label: ns })) ?? [];

  // --- State Variables ---
  const [selectedNamespace, setSelectedNamespace] = useState<OptionType | null>(
    initialFileCategory
  );
  const [messageSubjectList, setMessageSubjectList] = useState<string[]>([]);
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    name: '',
    role: '',
    model: selectedModel || defaultModel,
    basePrompt: '',
    topP: 1,
    temperature: 0.1
  });
  const [isNewChat, setIsNewChat] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const handleAddTag = (newTag: string) => {
    setTags(prevTags => [...prevTags, newTag]);
  };

  // --- Handlers ---
  const handleModelChange = (selectedOption: SingleValue<OptionType>) => {
    setSelectedModel(selectedOption);

    //when it  just start
    if (selectedOption && (isNewChat || chatHistory.length === 1)) {
      setChatHistory(prevHistory => [
        {
          ...prevHistory[0],
          model: selectedOption.label
        }
      ]);
    }
  };

  const handleNamespaceChange = (selectedOption: OptionType | null) => {
    setSelectedNamespace(selectedOption);
  };

  const fetchChatResponse = useCallback(
    async (
      question: string,
      fileSrc: FileData[],
      selectedModel: OptionType,
      namespace: string
    ) => {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            aiConfig,
            question,
            fileSrc,
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

        return data;
      } catch (error) {
        console.error('Error fetching chat response:', error);
        setLoading(false);
        setError('Problem fetch response from AI. Try again.');
      }
    },
    [chatHistory, aiConfig]
  );

  const saveChatMessageToDb = async (
    question: string,
    fileSrc: FileData[],
    data: any
  ) => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    // when it is a new chat stream, create a new chat in db before save chat message
    // then add this new chat to chats
    if (chatHistory.length === 1 || !chatId) {
      const chat = await updateChats(token, data.subject, {});

      // Check if chat is null
      if (!chat || !chat.id) {
        setError('Failed to create or retrieve chat.');
        console.error('Failed to create or retrieve chat.');
        return;
      }

      // update chat state
      setChatId(chat.id);
      const newChat = {
        label: chat.title,
        value: chat.id.toString()
      };
      setChats(prevChats => [newChat, ...prevChats]); // add new chat to the first of the chat list

      updateChatMessages(
        token,
        chat.id,
        question,
        data.answer,
        selectedModel.label,
        fileSrc
      );

      // when it is an existing chat, directly save chat message
    } else {
      updateChatMessages(
        token,
        parseInt(chatId),
        question,
        data.answer,
        selectedModel.label,
        fileSrc
      );
    }
  };

  const handleSubmit = async (question: string, fileSrc: FileData[]) => {
    setError(null);
    setLoading(true);
    setFileSrcHistory((prevHistory: FileData[][]) => [...prevHistory, fileSrc]);

    setChatHistory((prevHistory: Message[]) => [
      ...prevHistory,
      { question: question, answer: '', model: selectedModel.label }
    ]);

    try {
      const data = await fetchChatResponse(
        question,
        fileSrc,
        selectedModel,
        selectedNamespace?.value || 'none'
      );

      if (!data) {
        if (
          selectedModel.category !== 'hf-large' &&
          selectedModel.category !== 'hf-small'
        ) {
          setError(
            `We're experiencing issues with ${selectedModel.label} AI service provided by ${selectedModel.category}.  Please try again later.`
          );
          return;
        } else {
          setError(
            'Backend server error. Please check if your SmartChat-Python app is running.'
          );
          return;
        }
      }
      console.log('data.answer', data.answer);
      setLoading(false);

      setMessageSubjectList(prevList => [...prevList, data.subject]);

      setChatHistory((prevHistory: Message[]) => [
        ...prevHistory.slice(0, -1), // remove the last one that only has user message,but no AI response
        { question: question, answer: data.answer, model: selectedModel.label }
      ]);

      // Retrieve the token just before making the API call
      const token = window.localStorage.getItem('token');

      if (!token) {
        setError('You must be logged in to submit a message.');
        return;
      }

      saveChatMessageToDb(question, fileSrc, {
        answer: data.answer,
        subject: data.subject
      });
    } catch (error) {
      setError('Error on saving chats in database');
      console.error('error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = (id: number) => {
    setFileSrcHistory((prevHistory: FileData[][]) => {
      const newHistory = [...prevHistory];
      newHistory[newHistory.length - 1] = [
        ...newHistory[newHistory.length - 1].slice(0, id),
        ...newHistory[newHistory.length - 1].slice(id + 1)
      ];
      return newHistory;
    });
  };

  const handleRetry = () => {
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      const lastFileSrc = fileSrcHistory[fileSrcHistory.length - 1];

      // Remove the last message from the chat history
      setChatHistory(prevHistory => prevHistory.slice(0, -1));
      setFileSrcHistory(prevHistory => prevHistory.slice(0, -1));
      // Resend the last user message
      handleSubmit(lastMessage.question, lastFileSrc);
    }
  };

  const handleCopy = () => {
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      navigator.clipboard
        .writeText(lastMessage.answer)
        .then(() => {
          // Optionally, you can show a notification that the text was copied
          setError('Text copied to clipboard');
          setTimeout(() => setError(null), 3000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          setError('Failed to copy text');
        });
    }
  };

  useEffect(() => {
    setNamespacesList(fetchedCategoryOptions);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset chat history when starting a new chat
  useEffect(() => {
    if (isNewChat) {
      setChatHistory([initialMessage]);
      setFileSrcHistory([[]]); // Reset file history as well
      setIsNewChat(false);
    }
    // eslint-disable-next-line
  }, [isNewChat]);

  return (
    <div className="flex flex-col w-full h-full mx-auto z-80">
      {isConfigPanelVisible && (
        <div className="flex-shrink-0 w-full px-4 pt-1 pb-4">
          <AIConfigPanel
            selectedModel={selectedModel}
            handleModelChange={handleModelChange}
            selectedNamespace={selectedNamespace}
            handleNamespaceChange={handleNamespaceChange}
            aiConfig={aiConfig}
            setAIConfig={setAIConfig}
            modelOptions={modelOptions}
            fileCategoryOptions={fetchedCategoryOptions}
          />
        </div>
      )}
      <div className="flex-grow overflow-y-auto">
        <div className="flex justify-end space-x-2 p-2">
          {tags.length > 0 && (
            <div className="px-4 py-2 bg-blue-100 text-gray-800">
              Tags: {tags.join(', ')}
            </div>
          )}
          <Modal
            onAddTag={handleAddTag}
            description="Enter a new tag name. Click save when you're done."
            title="Add New Tag"
            label="Tag"
          />
        </div>
        <ChatMessageList
          chatHistory={chatHistory}
          loading={loading}
          fileSrcHistory={fileSrcHistory}
          handleFileDelete={handleFileDelete}
          modelOptions={modelOptions}
          selectedModel={selectedModel}
          handleModelChange={handleModelChange}
          handleCopy={handleCopy}
          handleRetry={handleRetry}
        />
      </div>
      <ChatInput
        onSubmit={handleSubmit}
        isVisionModel={!!selectedModel.vision}
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

export default WithAuth(HomePage);
