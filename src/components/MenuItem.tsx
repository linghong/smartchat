import React, { useState, useCallback, FC, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Filter,
  Check,
  Pencil
} from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { useChatContext } from '@/src/context/ChatContext';
import { OptionType } from '@/src/types/common';

interface MenuItemProps {
  title: string;
  link?: string;
  itemList: OptionType[] | null;
  defaultOpen?: boolean;
  setIsSidebarOpen?: (isSidebarOpen: boolean) => void;
  onItemClick?: (id: string) => void;
  maxVisibleItem?: number;
  activeItemId?: string;
  onDeleteClick?: (id: string) => void;
  onEditClick?: (id: string, newTitle: string) => void;
}

const MenuItem: FC<MenuItemProps> = ({
  title,
  link,
  itemList,
  defaultOpen = false,
  setIsSidebarOpen,
  maxVisibleItem = 15,
  onItemClick,
  activeItemId,
  onDeleteClick,
  onEditClick
}) => {
  const router = useRouter();
  const isActive = link && router.pathname === link;

  const { isSearchChat, setIsSearchChat } = useChatContext();

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);

  const handleToggleSearch = () => {
    if (setIsSearchChat) {
      setIsSearchChat(!isSearchChat);
    }
  };

  const handleItemListLinkClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (link) {
        await router.push(link);
        if (setIsSidebarOpen && window.innerWidth <= 640) {
          setIsSidebarOpen(false);
        }
      }
    },
    [link, router, setIsSidebarOpen]
  );

  const ITEM_HEIGHT = 30;
  const MAX_HEIGHT = maxVisibleItem * ITEM_HEIGHT;

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      if (!itemList) return null;
      const item = itemList[index];

      const handleItemPageClick = (id: string) => {
        setEditingId(null);
        setEditingTitle('');
        if (onItemClick) {
          onItemClick(id);
        }
      };

      const handleEditStart = (id: string, currentTitle: string) => {
        setEditingId(id);
        setEditingTitle(currentTitle);
      };

      const handleEditSubmit = (id: string) => {
        if (onEditClick && editingTitle.trim() !== '') {
          onEditClick(id, editingTitle.trim());
        }
        setEditingId(null);
      };

      const isActiveLi = activeItemId === item.value;
      const isEditing = editingId === item.value;

      return (
        <div
          style={style}
          className={`flex justify-between items-center px-3 py-2 tracking-tight text-sm font-normal transition-colors duration-200 hover:bg-slate-600 hover:rounded focus-within:bg-indigo-100 ${isActiveLi ? 'bg-slate-400 text-indigo-200 rounded-sm' : 'text-slate-200'}`}
        >
          {isEditing ? (
            <>
              <input
                type="text"
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                className="mr-1 p-1 border rounded bg-slate-600 text-slate-200 w-11/12"
                autoFocus
                aria-label={`Edit ${item.label}`}
              />
              <button
                onClick={() => handleEditSubmit(item.value)}
                className="text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Submit edit"
              >
                <Check size="18" />
              </button>
            </>
          ) : (
            <>
              <button
                className="truncate text-left w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                onClick={() => handleItemPageClick(item.value)}
                aria-label={item.label}
              >
                {item.label}
              </button>
              <div className="flex space-x-1">
                <button
                  className="cursor-pointer hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  onClick={() => onDeleteClick && onDeleteClick(item.value)}
                  aria-label={`Delete ${item.label}`}
                >
                  <Trash2 size={14} color="#f1f0f5" fill="#e7e7f5" />
                </button>
                <button
                  className="cursor-pointer hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  onClick={() => handleEditStart(item.value, item.label)}
                  aria-label={`Edit ${item.label}`}
                >
                  <Pencil
                    size={14}
                    color="#f1f0f5"
                    className="pl-1 border-b 2px white"
                  />
                </button>
              </div>
            </>
          )}
        </div>
      );
    },
    [
      itemList,
      onItemClick,
      activeItemId,
      onDeleteClick,
      onEditClick,
      editingId,
      editingTitle
    ]
  );

  const listHeight = useMemo(() => {
    if (!itemList) return 0;
    return Math.min(itemList.length * ITEM_HEIGHT, MAX_HEIGHT);
  }, [itemList, MAX_HEIGHT]);

  return (
    <div className="mt-6 font-semibold">
      <div
        className={`flex justify-between items-center px-1 py-1 border-b text-slate-100 cursor-pointer transition-colors duration-200 hover:bg-slate-500 focus:bg-indigo-100`}
      >
        {title === 'Chat With AI' && (
          <button
            onClick={handleToggleSearch}
            className="mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label="Toggle search"
          >
            <Filter className="text-gray-400 hover:text-indigo-300" size={18} />
          </button>
        )}
        {link ? (
          <Link
            href={link}
            className={`flex-grow px-2 transition-colors duration-200 hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
            onClick={handleItemListLinkClick}
            aria-current={isActive ? 'page' : undefined}
          >
            {title}
          </Link>
        ) : (
          <span className="flex-grow text-slate-50 ">{title}</span>
        )}

        <button
          className="cursor-pointer transition-colors duration-200 hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-controls={`menuitem-list-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          <span className="sr-only">
            {isOpen ? `Collapse ${title}` : `Expand ${title}`}
          </span>
        </button>
      </div>
      {isOpen && itemList && itemList.length > 0 && (
        <div
          className="px-1 py-2 font-medium text-slate-200"
          style={{ height: listHeight }}
          id={`menuitem-list-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                width={width}
                height={listHeight}
                itemCount={itemList.length}
                itemSize={ITEM_HEIGHT}
                className={
                  itemList.length > maxVisibleItem ? 'custom-scrollbar' : ''
                }
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      )}
    </div>
  );
};

export default MenuItem;
