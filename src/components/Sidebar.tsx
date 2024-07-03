import React, { useState, useEffect, FC } from 'react';

import MenuItem from '@/src/components/MenuItem';
import { Chat } from '@/src/types/chat';

interface SidebarProps {
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}

const files = [
  {
    title: 'File 1',
    id: 1
  },
  {
    title: 'File 2',
    id: 2
  }
];
const models = [
  {
    title: 'Model 1',
    id: 1
  },
  {
    title: 'Model 2',
    id: 2
  }
];

const Sidebar: FC<SidebarProps> = ({ setIsSidebarOpen }) => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chats');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setChats(data);
      } catch (error: any) {
        console.error(`Failed to fetch chats: ${error.message}`);
      }
    };

    fetchChats();
  }, []);

  return (
    <ul className="px-2 pt-10 ">
      <MenuItem
        key="embedragfile"
        title="Embed RAG File"
        link="/embedragfile"
        itemList={files}
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
        defaultOpen={true}
      />
    </ul>
  );
};

export default Sidebar;
