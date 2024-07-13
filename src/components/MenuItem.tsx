import React, { useState, useCallback, FC, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai';
import {
  List,
  AutoSizer,
  ListRowProps,
  CellMeasurer,
  CellMeasurerCache
} from 'react-virtualized';

import { OptionType } from '@/src/types/common';

interface MenuItemProps {
  title: string;
  link?: string;
  itemList: OptionType[] | null;
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
        await router.push(link);
        if (setIsSidebarOpen && window.innerWidth <= 480) {
          setIsSidebarOpen(false);
        }
      }
    },
    [link, router, setIsSidebarOpen]
  );

  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 40
      }),
    []
  );

  const renderRow = useCallback(
    ({ index, key, style, parent }: ListRowProps) => {
      if (!itemList) return;
      const item = itemList[index];
      return (
        <CellMeasurer
          key={key}
          cache={cache}
          parent={parent}
          columnIndex={0}
          rowIndex={index}
        >
          {({ measure }) => (
            <li
              style={style}
              className="px-3 py-2 tracking-tight text-sm font-normal truncate transition-colors duration-200 hover:bg-slate-400 hover:rounded focus:bg-indigo-100"
              onLoad={measure}
            >
              {item.label}
            </li>
          )}
        </CellMeasurer>
      );
    },
    [itemList, cache]
  );

  const listHeight = useMemo(() => {
    const itemHeight = 40; // Assuming each item is 40px high
    const maxHeight = 320; // Maximum height of the list
    const calculatedHeight = itemList ? itemList.length * itemHeight : 0;
    return Math.min(calculatedHeight, maxHeight);
  }, [itemList]);

  return (
    <li className="mt-6 font-semibold">
      <div
        className={`flex justify-between items-center px-1 py-1 border-b cursor-pointer transition-colors duration-200 hover:bg-slate-500 focus:bg-indigo-100  ${isActive ? 'bg-slate-400 text-indigo-200 rounded-sm' : 'text-slate-50'}`}
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
        <ul className="px-1 py-2 font-medium text-slate-200 max-h-80">
          {itemList && (
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  width={width}
                  height={listHeight}
                  rowCount={itemList.length}
                  deferredMeasurementCache={cache}
                  rowHeight={cache.rowHeight}
                  rowRenderer={renderRow}
                  overscanRowCount={5}
                  className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-300"
                />
              )}
            </AutoSizer>
          )}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
