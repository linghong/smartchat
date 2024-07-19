import React, { useState, useEffect, useRef, FC } from 'react';

import MenuItem from '@/src/components/MenuItem';
import AIHub from '@/src/components/AIHub';
import { OptionType } from '@/src/types/common';
import { fetchChats } from '@/src/utils/sqliteApiClient';

interface SidebarProps {
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  namespacesList: OptionType[] | null;
  chatId: string | null;
  setChatId: (chatId: string | null) => void;
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
  setIsSidebarOpen,
  namespacesList,
  chatId,
  setChatId
}) => {
  const [chats, setChats] = useState<OptionType[]>([]);
  const isFetchingChats = useRef(false);

  useEffect(() => {
    const fetchAllChats = async () => {
      // avoid calling db twice, which causes the second call fetching data in the middle of the first call to complete the db inlization
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

  const handleChatClick = (chatId: string) => {
    setChatId(chatId);
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
          defaultOpen={true}
        />
      </ul>
      <AIHub />
    </div>
  );
};

export default Sidebar;
