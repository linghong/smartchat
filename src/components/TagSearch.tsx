import { FC, useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';

import { useChatContext } from '@/src/context/ChatContext';
import { OptionType } from '@/src/types/common';

interface TagSearchProps {
  onFilterChats: (filteredChats: OptionType[]) => void;
}

const TagSearch: FC<TagSearchProps> = ({ onFilterChats }) => {
  const { chats } = useChatContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    return Array.from(new Set(chats.flatMap(chat => chat.tags || [])));
  }, [chats]);

  useEffect(() => {
    const filteredChats = chats.filter(chat =>
      selectedTags.every(tag => chat.tags?.includes(tag))
    );
    onFilterChats(filteredChats);

    const newSuggestedTags = allTags.filter(
      tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedTags.includes(tag)
    );
    setSuggestedTags(newSuggestedTags);
  }, [allTags, chats, onFilterChats, searchTerm, selectedTags]);

  const handleTagClick = (tag: string) => {
    setSelectedTags([...selectedTags, tag]);
    setSearchTerm('');
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
      <label
        htmlFor="tag-search"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Search Tags
      </label>
      <div className="relative">
        <input
          id="tag-search"
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Type to search tags, and click a tag to select"
          className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Search for tags"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={16}
          aria-hidden="true"
        />
      </div>
      {selectedTags.length > 0 && (
        <div className="mt-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Tags:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      {suggestedTags.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Suggested Tags:
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSearch;
