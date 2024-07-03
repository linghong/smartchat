import React, { useState, FC } from 'react';
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

  const toggle = () => setIsOpen(!isOpen);

  const handleLinkClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (link) {
      // await its completion to ensure that any state changes occur after navigating, so that the sidebar won't open before the navigation completes
      await router.push(link);
      if (setIsSidebarOpen && window.innerWidth <= 480) {
        setIsSidebarOpen(false);
      }
    }
  };

  return (
    <li className="mt-5 my-8 font-semibold">
      <div
        className={`flex justify-between items-center px-3 py-1 border-b hover:bg-slate-500 focus:bg-indigo-100 cursor-pointer ${isActive ? 'bg-slate-400 text-indigo-200 rounded-sm' : 'text-slate-50'}`}
      >
        {link ? (
          <Link
            href={link}
            className={`flex-grow px-2 hover:underline `}
            onClick={handleLinkClick}
          >
            {title}
          </Link>
        ) : (
          <span className="flex-grow text-slate-50 ">{title}</span>
        )}
        <span role="button" className="cursor-pointer" onClick={toggle}>
          {isOpen ? <AiFillCaretUp /> : <AiFillCaretDown />}
        </span>
      </div>
      {isOpen && (
        <ul className="px-6 py-2 font-medium text-slate-200">
          {itemList.map(item => (
            <li
              key={item.id}
              className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100"
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
