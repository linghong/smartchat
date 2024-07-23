import React, { useState, useCallback, FC, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai';
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
  activeItemId?: string;
}

const MenuItem: FC<MenuItemProps> = ({
  title,
  link,
  itemList,
  defaultOpen = false,
  setIsSidebarOpen,
  onItemClick,
  activeItemId
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const router = useRouter();
  const isActive = link && router.pathname === link;

  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);

  const handleLinkClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (link) {
        await router.push(link);
        if (setIsSidebarOpen && window.innerWidth <= 480) {
          setIsSidebarOpen(false);
        }
      }
    },
    [link, router, setIsSidebarOpen]
  );

  const Row = useCallback(
    ({ index }: { index: number; style: React.CSSProperties }) => {
      if (!itemList) return null;
      const item = itemList[index];

      const handleClick = (id: string) => {
        if (onItemClick) {
          onItemClick(id);
        }
      };
      const isActiveLi = activeItemId === item.value;

      return (
        <li
          className={`px-3 py-2 tracking-tight text-sm font-normal truncate transition-colors duration-200 hover:bg-slate-600 hover:rounded focus:bg-indigo-100 ${isActiveLi ? 'bg-slate-400 text-indigo-200 rounded-sm' : 'text-slate-200'}`}
          onClick={() => handleClick(item.value)}
        >
          {item.label}
        </li>
      );
    },
    [itemList, onItemClick, activeItemId]
  );

  const listHeight = useMemo(() => {
    const itemHeight = 40; // Assuming each item is 40px high
    const maxHeight = 360; // Maximum height of the list
    const calculatedHeight = itemList ? itemList.length * itemHeight : 0;
    return Math.min(calculatedHeight, maxHeight);
  }, [itemList]);

  return (
    <li className="mt-6 font-semibold">
      <div
        className={`flex justify-between items-center px-1 py-1 border-b text-slate-100 cursor-pointer transition-colors duration-200 hover:bg-slate-500 focus:bg-indigo-100 }`}
      >
        {link ? (
          <Link
            href={link}
            className={`flex-grow px-2 transition-colors duration-200 hover:text-indigo-300`}
            onClick={handleLinkClick}
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
      {isOpen && (
        <ul className="px-1 py-2 font-medium text-slate-200 max-h-80">
          {itemList && (
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  width={width}
                  height={listHeight}
                  itemCount={itemList.length}
                  itemSize={40}
                  className="custom-scrollbar"
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          )}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
