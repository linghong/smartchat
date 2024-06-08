import React, { useState, FC, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { MdExpandMore, MdExpandLess } from 'react-icons/md' 

interface MenuItemProps {
  title: string;
  link?: string;
  itemList: string[];
  defaultOpen?: boolean;
  setIsSidebarOpen?: (isSidebarOpen: boolean) => void; 
}

const MenuItem: FC<MenuItemProps> = ({ title, link, itemList, defaultOpen = false, setIsSidebarOpen }) => {

  const [isOpen, setIsOpen] = useState(defaultOpen);

  const router = useRouter()
  const isActive = link && router.pathname === link

  const toggle = () => setIsOpen(!isOpen)

  const handleLinkClick = () => {
    if (setIsSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <li className="mt-5 my-8 font-semibold" >
      <div className={`flex justify-between items-center px-3 py-1 border-b hover:bg-slate-500 focus:bg-indigo-100 cursor-pointer ${isActive ? 'bg-slate-400 text-indigo-200 rounded-sm' : 'text-slate-50'}`} >
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
          {isOpen ? <MdExpandLess /> : <MdExpandMore />}
        </span>
      </div>
      {isOpen && (
        <ul className="px-6 py-2 font-medium text-slate-200">
          { itemList.map((item)=>
            <li key={item} className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">
            {item}
            </li>
          )}
        </ul>
      )}
    </li>
  )
}

export default MenuItem