import React, { useState, useCallback, FC, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AiFillCaretDown,
  AiFillCaretUp,
  AiFillDelete,
  AiFillEdit,
  AiOutlineCheck,
  AiOutlineClose
} from 'react-icons/ai';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { OptionType } from '@/src/types/common';

interface MenuItemProps {
  title: string;
  link?: string;
  itemList: OptionType[] | null;
  defaultOpen?: boolean;
  setIsSidebarOpen?: (isSidebarOpen: boolean) => void;
  onItemClick?: (id: string) => void;
  activeItemId?: string; //for chat, it is the chatId currently displays the chat content in main component
  onDeleteClick?: (id: string) => void;
  onEditClick?: (id: string, newTitle: string) => void;
}

const MenuItem: FC<MenuItemProps> = ({
  title,
  link,
  itemList,
  defaultOpen = false,
  setIsSidebarOpen,
  onItemClick,
  activeItemId,
  onDeleteClick,
  onEditClick
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const router = useRouter();
  const isActive = link && router.pathname === link;

  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);

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

  // Constants
  const ITEM_HEIGHT = 40; // Height of each item
  const MAX_VISIBLE_ITEMS = 9; // Maximum number of items visible without scrolling
  const MAX_HEIGHT = MAX_VISIBLE_ITEMS * ITEM_HEIGHT;

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
          className={`flex justify-between items-center px-3 py-2 tracking-tight text-sm font-normal transition-colors duration-200 hover:bg-slate-600 hover:rounded focus:bg-indigo-100 ${isActiveLi ? 'bg-slate-400 text-indigo-200 rounded-sm' : 'text-slate-200'}`}
        >
          {isEditing ? (
            <>
              <input
                type="text"
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                className="mr-1 p-1 border rounded bg-slate-600 text-slate-200 w-11/12"
                autoFocus
              />
              <button
                onClick={() => handleEditSubmit(item.value)}
                className="text-green-500"
              >
                <AiOutlineCheck />
              </button>
            </>
          ) : (
            <>
              <span
                className="truncate"
                onClick={() => handleItemPageClick(item.value)}
              >
                {item.label}
              </span>
              <div className="flex space-x-1">
                <AiFillDelete
                  className="cursor-pointer hover:text-red-500"
                  onClick={() => onDeleteClick && onDeleteClick(item.value)}
                />
                <AiFillEdit
                  className="cursor-pointer hover:text-indigo-300"
                  onClick={() => handleEditStart(item.value, item.label)}
                />
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
        className={`flex justify-between items-center px-1 py-1 border-b text-slate-100 cursor-pointer transition-colors duration-200 hover:bg-slate-500 focus:bg-indigo-100 }`}
      >
        {link ? (
          <Link
            href={link}
            className={`flex-grow px-2 transition-colors duration-200 hover:text-indigo-300`}
            onClick={handleItemListLinkClick}
          >
            {title}
          </Link>
        ) : (
          <span className="flex-grow text-slate-50 ">{title}</span>
        )}
        <button
          role="button"
          className="cursor-pointer transition-colors duration-200 hover:text-indigo-300"
          onClick={handleToggle}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? <AiFillCaretUp size={18} /> : <AiFillCaretDown size={18} />}
        </button>
      </div>
      {isOpen && itemList && itemList.length > 0 && (
        <div
          className="px-1 py-2 font-medium text-slate-200"
          style={{ height: listHeight }}
        >
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                width={width}
                height={listHeight}
                itemCount={itemList.length}
                itemSize={ITEM_HEIGHT}
                className={
                  itemList.length > MAX_VISIBLE_ITEMS ? 'custom-scrollbar' : ''
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
