import React, { useState, useCallback } from 'react';
import { OptionType } from '@/src/types/common';
import TagSearch from '@/src/components/TagSearch';

interface ChatListProps {
  chats: OptionType[];
}

const ChatList: React.FC<ChatListProps> = ({ chats }) => {
  const [filteredChats, setFilteredChats] = useState<OptionType[]>(chats);

  const handleFilterChats = useCallback((newFilteredChats: OptionType[]) => {
    setFilteredChats(newFilteredChats);
  }, []);

  return (
    <div>
      <TagSearch chats={chats} onFilterChats={handleFilterChats} />
      <div className="flex-grow overflow-y-auto bg-white border-2 border-stone-200">
        {filteredChats.length > 0 ? (
          <div className="p-4">
            <h3 className="font-bold mb-2">Filtered Chats:</h3>
            {filteredChats.map(chat => (
              <div key={chat.value} className="mb-2 p-2 bg-gray-100 rounded">
                <p>{chat.label}</p>
                {chat.tags && (
                  <div className="mt-1">
                    {chat.tags.map(tag => (
                      <span
                        key={tag}
                        className="mr-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No chats found matching the selected tags.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
