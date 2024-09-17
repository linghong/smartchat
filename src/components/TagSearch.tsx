import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { OptionType } from '@/src/types/common';

interface TagSearchProps {
  chats: OptionType[];
  onFilterChats: (filteredChats: OptionType[]) => void;
}

const TagSearch: React.FC<TagSearchProps> = ({ chats, onFilterChats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  // Extract all unique tags from chats
  const allTags = Array.from(new Set(chats.flatMap(chat => chat.tags || [])));

  useEffect(() => {
    // Filter chats based on selected tags
    const filteredChats = chats.filter(chat =>
      selectedTags.every(tag => chat.tags?.includes(tag))
    );
    onFilterChats(filteredChats);

    // Update suggested tags based on search term
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
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search tags..."
          className="w-full px-4 py-2 border rounded-md pl-10 text-sm"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={16}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <span
            key={tag}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
          >
            {tag}
            <button
              onClick={() => handleTagRemove(tag)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      {suggestedTags.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-600">Suggested tags:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {suggestedTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs"
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
