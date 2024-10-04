import {
  useState,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
  ReactNode
} from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { SingleValue } from 'react-select';

import AIConfigPanel from '@/src/components/AIConfigPanel';
import ChatHeader from '@/src/components/ChatHeader';
import ChatInput from '@/src/components/ChatInput';
import ChatList from '@/src/components/ChatList';
import ChatMessageList from '@/src/components/ChatMessageList';
import Notification from '@/src/components/Notification';
import WithAuth from '@/src/components/WithAuth';
import { useChatContext } from '@/src/context/ChatContext';

import { modelOptions } from '@/config/modellist';
import { Message, FileData, AIConfig, AssistantOption } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { fetchNamespaces } from '@/src/utils/fetchNamespaces';
import {
  initialMessage,
  defaultModel,
  defaultAssistants
} from '@/src/utils/initialData';
import { getAIConfigs } from '@/src/utils/sqliteAIConfigApiClient';
import { updateChats } from '@/src/utils/sqliteChatApiClient';
import {
  updateChatMessages,
  updateChat
} from '@/src/utils/sqliteChatIdApiClient';

const initialFileCategory: OptionType = { value: 'none', label: 'None' };

interface HomeProps {
  namespaces: string[];
  setNamespacesList: Dispatch<SetStateAction<OptionType[]>>;
}

const HomePage: React.FC<HomeProps> = ({ namespaces, setNamespacesList }) => {
  const router = useRouter();

  const {
    isNewChat,
    setIsNewChat,
    isConfigPanelVisible,
    isSearchChat,
    fileSrcHistory,
    setFileSrcHistory,
    chatHistory,
    setChatHistory,
    activeChat,
    setActiveChat,
    chats,
    setChats,
    selectedModel,
    setSelectedModel
  } = useChatContext();

  // Derived state for namespace options
  const fetchedCategoryOptions =
    namespaces.map(ns => ({ value: ns, label: ns })) ?? [];

  // --- State Variables ---
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantOption>(
    defaultAssistants[0]
  );

  const [selectedNamespace, setSelectedNamespace] = useState<OptionType | null>(
    initialFileCategory
  );
  const [assistantOptions, setAssistantOptions] =
    useState<AssistantOption[]>(defaultAssistants);
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    name: '',
    role: '',
    model: selectedModel || defaultModel,
    basePrompt: '',
    topP: 1,
    temperature: 0.1
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | ReactNode | null>(null);
  const [messageSubjectList, setMessageSubjectList] = useState<string[]>([]);

  // --- Handlers ---
  const handleModelChange = (selectedOption: SingleValue<OptionType>) => {
    if (!selectedOption) return defaultModel;
    setSelectedModel(selectedOption);

    //when it just start
    if (selectedOption && (isNewChat || chatHistory.length === 1)) {
      setChatHistory((prevHistory: Message[]) => [
        {
          ...prevHistory[0],
          model: selectedOption.label
        }
      ]);
    }
  };

  const handleAssistantChange = (newAssistant: AssistantOption) => {
    setSelectedAssistant(newAssistant);
  };

  const handleNamespaceChange = (selectedOption: OptionType | null) => {
    setSelectedNamespace(selectedOption);
  };

  const fetchChatResponse = useCallback(
    async (
      question: string,
      fileSrc: FileData[],
      selectedAssistant: AssistantOption,
      namespace: string
    ) => {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question,
            fileSrc,
            chatHistory,
            namespace,
            selectedAssistant
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError('There is a server-side error. Try it again later.');
        }

        const data = await response.json();

        return data;
      } catch (error) {
        console.error('Error fetching chat response:', error);
        setLoading(false);
        setError(
          `We're experiencing issues with fetching model response. Please try again later.`
        );
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

    // when it is a new chat stream, the chatId is set to '0',
    // after it has a real chat message, it generate a new chat in db with an id
    // this id is also be set as chatId in the front
    // then add this new chat to chats
    if (activeChat.value === '0') {
      const chat = await updateChats(
        token,
        data.subject,
        activeChat.tags || [],
        {}
      );

      // Check if chat is null
      if (!chat || !chat.id) {
        setError('Failed to create or retrieve chat.');
        console.error('Failed to create or retrieve chat.');
        return;
      }

      // update chat state
      const newChat = {
        label: chat.title,
        value: chat.id.toString(),
        tags: chat.tags
      };
      setActiveChat(newChat);
      setChats((prevChats: OptionType[]) => [newChat, ...prevChats]); // add new chat to the first of the chat list

      updateChatMessages(
        token,
        chat.id,
        question,
        data.answer,
        selectedAssistant.label,
        fileSrc
      );

      // when it is an existing chat, directly save chat message
    } else {
      updateChatMessages(
        token,
        parseInt(activeChat.value),
        question,
        data.answer,
        selectedAssistant.label,
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
      { question: question, answer: '', assistant: selectedAssistant.label }
    ]);
    try {
      const data = await fetchChatResponse(
        question,
        fileSrc,
        selectedAssistant,
        selectedNamespace?.value || 'none'
      );

      if (!data) {
        if (
          selectedModel.category === 'hf-large' ||
          selectedModel.category === 'hf-small'
        ) {
          setError(
            <>
              SmartChat-FastAPI app is required. Please make sure your{' '}
              <a
                href="http://github.com/githubusername/reponame"
                target="_blank"
                rel="noopener noreferrer"
              >
                SmartChat-FastAPI
              </a>{' '}
              app is running.
            </>
          );
        }
        return;
      }

      setLoading(false);

      setMessageSubjectList(prevList => [...prevList, data.subject]);

      setChatHistory((prevHistory: Message[]) => [
        ...prevHistory.slice(0, -1), // remove the last one that only has user message,but no AI response
        {
          question: question,
          answer: data.answer,
          assistant: selectedAssistant.label
        }
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
      setChatHistory((prevHistory: Message[]) => prevHistory.slice(0, -1));
      setFileSrcHistory((prevFileSrcHistory: FileData[][]) =>
        prevFileSrcHistory.slice(0, -1)
      );
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
  }, []);

  useEffect(() => {
    const fetchAssistants = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const fetchedAssistants = await getAIConfigs(token);

        const customAssistants: AssistantOption[] = fetchedAssistants.map(
          assistant => ({
            value: assistant.id
              ? assistant.id.toString()
              : assistant.name.split(' ').join(','),
            label: assistant.name,
            isDefault: false,
            config: assistant
          })
        );

        const newAssistantOptions = [...defaultAssistants, ...customAssistants];
        setAssistantOptions(newAssistantOptions);

        // Set an initial selected assistant if none is selected
        if (!selectedAssistant && newAssistantOptions.length > 0) {
          handleAssistantChange(newAssistantOptions[0]);
        }
      }
    };

    fetchAssistants();
  }, [selectedAssistant]);

  // Reset chat history when starting a new chat
  useEffect(() => {
    if (isNewChat) {
      setActiveChat({ value: '0', label: '0', tags: [] });
      setSelectedModel(defaultModel);
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
      {isSearchChat && <ChatList />}
      {!isSearchChat && (
        <div className="flex-grow overflow-y-auto">
          <ChatHeader
            assistantOptions={assistantOptions}
            selectedAssistant={selectedAssistant}
            handleAssistantChange={handleAssistantChange}
          />
          <ChatMessageList
            loading={loading}
            handleFileDelete={handleFileDelete}
            assistantOptions={assistantOptions}
            selectedAssistant={selectedAssistant}
            handleAssistantChange={handleAssistantChange}
            handleCopy={handleCopy}
            handleRetry={handleRetry}
          />
        </div>
      )}
      {!isSearchChat && (
        <ChatInput
          onSubmit={handleSubmit}
          isVisionModel={!!selectedModel.vision}
        />
      )}
      {!isSearchChat && error && <Notification type="error" message={error} />}
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
