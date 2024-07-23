import React, { useState, useEffect, useRef, FC } from 'react';

import MenuItem from '@/src/components/MenuItem';
import AIHub from '@/src/components/AIHub';
import { Message, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { fetchChats, fetchChatMessages } from '@/src/utils/sqliteApiClient';

interface SidebarProps {
  setIsConfigPanelVisible: (isConfigPanelVisible: boolean) => void;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  namespacesList: OptionType[] | null;
  chatId: string;
  setChatId: (chatId: string) => void;
  setChatHistory: (chatHistory: Message[]) => void;
  setImageSrcHistory: (ImageSrcHistory: ImageFile[][]) => void;
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
const initialMessage = {
  question: '',
  answer: 'Hi, how can I assist you?'
};
const Sidebar: FC<SidebarProps> = ({
  setIsConfigPanelVisible,
  setIsSidebarOpen,
  namespacesList,
  chatId,
  setChatId,
  setChatHistory,
  setImageSrcHistory
}) => {
  const [chats, setChats] = useState<OptionType[]>([]);
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
    if (chatMessages === null) {
      console.log('fetch Chat Messages returns an error');
      return;
    }
    const newChatHistory = chatMessages.map((m: any) => ({
      question: m.userMessage,
      answer: m.aiMessage
    }));

    const newImageSrcHistory = chatMessages.map((msg: any) => {
      return msg.images.map((img: any) => img.imageFile);
    });

    setIsConfigPanelVisible(false);
    setChatId(chatId);
    setChatHistory([initialMessage, ...newChatHistory]);
    setImageSrcHistory([[], ...newImageSrcHistory]);
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
        />
      </ul>
      <AIHub />
    </div>
  );
};

export default Sidebar;
