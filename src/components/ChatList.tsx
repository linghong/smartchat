import { FC, useState, useEffect, useCallback } from 'react';

import TagSearch from '@/src/components/TagSearch';
import { useChatContext } from '@/src/context/ChatContext';
import { OptionType } from '@/src/types/common';

const ChatList: FC = () => {
  const { chats } = useChatContext();

  const [filteredChats, setFilteredChats] = useState<OptionType[]>(chats);

  const handleFilterChats = useCallback((newFilteredChats: OptionType[]) => {
    setFilteredChats(newFilteredChats);
  }, []);

  // Update filteredChats when the `chats` prop changes
  useEffect(() => {
    setFilteredChats(chats);
  }, [chats]);

  return (
    <div>
      <TagSearch onFilterChats={handleFilterChats} />
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
                        className="mr-2 px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-xs"
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
