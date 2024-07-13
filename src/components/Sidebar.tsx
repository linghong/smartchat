import React, { useState, useEffect, FC } from 'react';

import MenuItem from '@/src/components/MenuItem';
import AIHub from '@/src/components/AIHub';
import { Chat } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

interface SidebarProps {
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
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
  const [chats, setChats] = useState<OptionType[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chats');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        const chats = data.map((d: Chat, i: number) => ({
          label: d.title,
          value: d.id.toString()
        }));
        setChats(chats);
      } catch (error: any) {
        console.error(`Failed to fetch chats: ${error.message}`);
      }
    };

    fetchChats();
  }, []);

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
          defaultOpen={true}
        />
      </ul>
      <AIHub />
    </div>
  );
};

export default Sidebar;
