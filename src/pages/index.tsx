import {
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
  Dispatch,
  SetStateAction
} from 'react';

import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { SingleValue, ActionMeta } from 'react-select';

import AIConfigPanel from '@/src/components/AIConfigPanel';
import ChatInput from '@/src/components/ChatInput';
import ChatMessageList from '@/src/components/ChatMessageList';
import Notification from '@/src/components/Notification';
import WithAuth from '@/src/components/WithAuth';

import { modelOptions } from '@/config/modellist';
import { Message, FileData } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { fetchNamespaces } from '@/src/utils/fetchNamespaces';
import { initialMessage } from '@/src/utils/initialData';
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

  // --- State Variables ---
  const [selectedNamespace, setSelectedNamespace] = useState<OptionType | null>(
    initialFileCategory
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
  const handleModelChange = (
    selectedOption: SingleValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
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

  const handleBasePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBasePrompt(e.target.value);
  };

  const fetchChatResponse = useCallback(
    async (
      basePrompt: string,
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
            basePrompt,
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
    [chatHistory]
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
        basePrompt,
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
            `We’re experiencing issues with ${selectedModel.label} AI service provided by ${selectedModel.category}.  Please try again later.`
          );
          return;
        } else {
          setError(
            'Backend server error. Please check if your SmartChat-Python app is running.'
          );
          return;
        }
      }

      setLoading(false);
      setMessageSubjectList(prevList => [...prevList, data.subject]);

      setChatHistory((prevHistory: Message[]) => [
        ...prevHistory.slice(0, -1), // remove the last one that only has user message,b ut no AI response
        { question: question, answer: data.answer, model: selectedModel.label }
      ]);

      // Retrieve the token just before making the API call
      const token = window.localStorage.getItem('token');

      if (!token) {
        setError('You must be logged in to submit a message.');
        return;
      }

      saveChatMessageToDb(question, fileSrc, data);
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
    <div className="flex flex-col w-full  h-full mx-auto z-80">
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
      <div className="flex-grow overflow-y-auto">
        <ChatMessageList
          chatHistory={chatHistory}
          loading={loading}
          fileSrcHistory={fileSrcHistory}
          handleFileDelete={handleFileDelete}
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
