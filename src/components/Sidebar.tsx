import { useEffect, useRef, FC, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/router';

import MenuItem from '@/src/components/MenuItem';
import AIHub from '@/src/components/AIHub';
import { useChatContext } from '@/src/context/ChatContext';
import { Message, FileData } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { initialMessage } from '@/src/utils/initialData';
import { fetchChats } from '@/src/utils/sqliteChatApiClient';
import {
  deleteChat,
  updateChat,
  fetchChatMessages
} from '@/src/utils/sqliteChatIdApiClient';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  namespacesList: OptionType[] | null;
}

const models = [
  {
    label: 'Model 1',
    value: 'model1'
  },
  {
    label: 'Model 2',
    value: 'model2'
  }
];

const Sidebar: FC<SidebarProps> = ({ setIsSidebarOpen, namespacesList }) => {
  const isFetchingChats = useRef(false);
  const router = useRouter();
  const pathName = router.pathname;

  const {
    setIsConfigPanelVisible,
    chatId,
    setChatId,
    chats,
    setChats,
    setChatHistory,
    setFileSrcHistory
  } = useChatContext();

  useEffect(() => {
    const fetchAllChats = async () => {
      const token = window.localStorage.getItem('token');

      if (!token || isFetchingChats.current) return;

      try {
        const chats = await fetchChats(token);

        if (chats) setChats(chats);
      } catch (error: any) {
        console.error(`Failed to fetch chats: ${error.message}`);
      }
    };

    fetchAllChats();
  }, []); //ensure this runs again if token changes

  const handleChatClick = async (chatId: string) => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const chatMessages = await fetchChatMessages(token, parseInt(chatId));

    // Check if chatMessages is an array and not empty
    if (Array.isArray(chatMessages) && chatMessages.length > 0) {
      const newChatHistory: Message[] = chatMessages.map(m => ({
        question: m.userMessage,
        answer: m.aiMessage,
        assistant: m.assistant
      }));

      const newFileSrcHistory: FileData[][] = chatMessages.map((msg: any) => {
        // Assuming msg.files is an array of { fileData: ... } objects
        if (!msg.files || !Array.isArray(msg.files)) return;
        return msg.files.map((file: any) => file.fileData);
      });
      // On mobile or narrow screen size, only either the sidebar or chat content is visible at a time
      if (window.innerWidth < 640) {
        setIsSidebarOpen(false);
      }

      setIsConfigPanelVisible(false);
      setChatId(chatId);

      setChatHistory(newChatHistory);
      setFileSrcHistory(newFileSrcHistory);
    } else {
      // Handle the case where there are no chat messages
      setChatHistory([initialMessage]);
      setFileSrcHistory([[]]);
    }
  };

  const handleDeleteChat = async (id: string) => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      await deleteChat(token, id);
      setChats(prevChats => prevChats.filter(chat => chat.value !== id));
      if (chatId === id) {
        setChatId('');
        setChatHistory([initialMessage]);
        setFileSrcHistory([[]]);
      }
    } catch (error: any) {
      console.error(`Failed to delete chat: ${error.message}`);
    }
  };

  const handleEditChat = async (id: string, newTitle: string) => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await updateChat(token, id, { title: newTitle });
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.value === id ? { ...chat, label: newTitle } : chat
        )
      );
    } catch (error: any) {
      console.error(`Failed to update chat title: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <ul className="flex-grow px-2 pt-3">
        <MenuItem
          key="embedragfile"
          title="Embed RAG File"
          link="/embedragfile"
          itemList={namespacesList}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <MenuItem
          key="finetunemodel"
          title="Finetune AI Model"
          link="/finetunemodel"
          itemList={models}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <MenuItem
          key="chatwithai"
          title="Chat With AI"
          link="/"
          itemList={chats}
          setIsSidebarOpen={setIsSidebarOpen}
          onItemClick={handleChatClick}
          activeItemId={chatId}
          defaultOpen={true}
          onDeleteClick={handleDeleteChat}
          onEditClick={handleEditChat}
        />
      </ul>
      <AIHub />
    </div>
  );
};

export default Sidebar;
