import React, { FC } from 'react'
import Link from 'next/link'
import PlusIcon from './PlusIcon'

interface SidebarProps {
  onNewChat: () => void;
}

const Sidebar : FC<SidebarProps>= ({ onNewChat }) => {

  return (
    <div className="w-80 bg-slate-600 text-slate-50">
       <ul className="px-4 py-2 m-0">
          <li  className="flex pl-4 py-5 font-semibold hover:bg-slate-400 focus:bg-indigo-100">
            <div className="flex bg-slate-500 rounded-xl pl-4 pr-12 py-1" onClick = { onNewChat }>
              <PlusIcon /> 
              <span>New Chat</span>
            </div>
          </li>
          <li  className="pl-4 py-2 mt-5 mr-8 font-semibold border-b text-slate-50 hover:bg-slate-400 focus:bg-indigo-100">
          <Link href="/managemyai">Manage My AI</Link>   
          </li>
          <ul className="px-4 py-2 font-medium text-slate-200">
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">File 1</li>
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">File 2</li>
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">File 3</li>
          </ul>
          <li  className="pl-4 py-2 mt-5 mr-8 font-semibold border-b text-slate-50 hover:bg-slate-400 focus:bg-indigo-100">       
          <Link href="/finetunemodel">Finetune AI Model</Link>   
          </li>
          <ul className="px-4 py-2 font-medium text-slate-200">
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">My Model 1</li>
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">My Model 2</li>
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">My Model 3</li>
          </ul>
          <li  className="pl-4 py-2 mt-5 mr-8 font-semibold border-b text-slate-50 hover:bg-slate-400 focus:bg-indigo-100">
            <Link href="/">
              Chat with AI
            </Link>
          </li>
          <ul className="px-4 py-2 font-medium text-slate-200">
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">Chat 1</li>
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">Chat 2</li>
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">Chat 3</li>
          </ul>
      </ul>
    </div>
  )
}

export default Sidebar
