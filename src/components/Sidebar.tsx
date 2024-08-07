import React, {
  useState,
  useEffect,
  useRef,
  FC,
  Dispatch,
  SetStateAction
} from 'react';

import MenuItem from '@/src/components/MenuItem';
import AIHub from '@/src/components/AIHub';
import { Message, ImageFile } from '@/src/types/chat';
import { initialMessage } from '@/src/utils/initialData';
import { OptionType } from '@/src/types/common';
import {
  fetchChats,
  fetchChatMessages,
  deleteChat,
  editChatTitle
} from '@/src/utils/sqliteApiClient';

interface SidebarProps {
  setIsConfigPanelVisible: Dispatch<SetStateAction<boolean>>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  namespacesList: OptionType[] | null;
  chatId: string;
  setChatId: Dispatch<SetStateAction<string>>;
  chats: OptionType[];
  setChats: Dispatch<SetStateAction<OptionType[]>>;
  setChatHistory: Dispatch<SetStateAction<Message[]>>;
  setImageSrcHistory: Dispatch<SetStateAction<ImageFile[][]>>;
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

const Sidebar: FC<SidebarProps> = ({
  setIsConfigPanelVisible,
  setIsSidebarOpen,
  namespacesList,
  chatId,
  setChatId,
  chats,
  setChats,
  setChatHistory,
  setImageSrcHistory
}) => {
  const isFetchingChats = useRef(false);

  useEffect(() => {
    const fetchAllChats = async () => {
      // Avoid calling db twice in dev environment,
      // Otherwise, the second call may fetch data in the middle of the first call's db initialization, causing issue of table metadata data missing.
      // If you want, you can remove this isFetchChats check before building the code for production.
      if (isFetchingChats.current) return;

      isFetchingChats.current = true;
      try {
        const chats = await fetchChats();
        if (chats) setChats(chats);
      } catch (error: any) {
        console.error(`Failed to fetch chats: ${error.message}`);
      } finally {
        isFetchingChats.current = false;
      }
    };

    fetchAllChats();
  }, []);

  const handleChatClick = async (chatId: string) => {
    const chatMessages = await fetchChatMessages(parseInt(chatId));

    // Check if chatMessages is an array and not empty
    if (Array.isArray(chatMessages) && chatMessages.length > 0) {
      const newChatHistory: Message[] = chatMessages.map(m => ({
        question: m.userMessage,
        answer: m.aiMessage,
        model: m.model
      }));

      const newImageSrcHistory: ImageFile[][] = chatMessages.map((msg: any) => {
        // Assuming msg.images is an array of { imageFile: ... } objects
        return msg.images.map((img: any) => img.imageFile);
      });
      setIsConfigPanelVisible(false);
      setChatId(chatId);
      setChatHistory(newChatHistory);
      setImageSrcHistory(newImageSrcHistory);
    } else {
      // Handle the case where there are no chat messages
      setChatHistory([initialMessage]);
      setImageSrcHistory([[]]);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await deleteChat(id);
      setChats(prevChats => prevChats.filter(chat => chat.value !== id));
      if (chatId === id) {
        setChatId('');
        setChatHistory([initialMessage]);
        setImageSrcHistory([[]]);
      }
    } catch (error: any) {
      console.error(`Failed to delete chat: ${error.message}`);
    }
  };
  const handleEditChat = async (id: string) => {
    const newTitle = prompt('Enter new chat title:');
    if (newTitle) {
      try {
        await editChatTitle(id, newTitle);
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.value === id ? { ...chat, label: newTitle } : chat
          )
        );
      } catch (error: any) {
        console.error(`Failed to update chat title: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <ul className="flex-grow px-2 pt-10 ">
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
