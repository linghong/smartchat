import React, { useState, useCallback, FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai';

import { Chat } from '@/src/types/chat';

interface MenuItemProps {
  title: string;
  link?: string;
  itemList: Chat[];
  defaultOpen?: boolean;
  setIsSidebarOpen?: (isSidebarOpen: boolean) => void;
}

const MenuItem: FC<MenuItemProps> = ({
  title,
  link,
  itemList,
  defaultOpen = false,
  setIsSidebarOpen
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const router = useRouter();
  const isActive = link && router.pathname === link;

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const handleLinkClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (link) {
        // await its completion to ensure that any state changes occur after navigating, so that the sidebar won't open before the navigation completes
        await router.push(link);
        if (setIsSidebarOpen && window.innerWidth <= 480) {
          setIsSidebarOpen(false);
        }
      }
    },
    [link, router, setIsSidebarOpen]
  );

  return (
    <li className="mt-6 font-semibold">
      <div
        className={`flex justify-between items-center px-3 py-1 border-b cursor-pointer transition-colors duration-200 hover:bg-slate-500 focus:bg-indigo-100  ${isActive ? 'bg-slate-400 text-indigo-200 rounded-sm' : 'text-slate-50'}`}
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
          onClick={toggle}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? <AiFillCaretUp size={18} /> : <AiFillCaretDown size={18} />}
        </button>
      </div>
      {isOpen && (
        <ul className="px-1 py-2 font-medium text-slate-200 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-300">
          {itemList.map(item => (
            <li
              key={item.id}
              className="px-2 py-2 tracking-tight text-sm font-normal truncate transition-colors duration-200 hover:bg-slate-400 hover:rounded focus:bg-indigo-100"
            >
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
