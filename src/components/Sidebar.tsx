import React, { FC } from 'react'
import MenuItem from './MenuItem'
import PlusIcon from './PlusIcon'

interface SidebarProps {
  onNewChat: () => void;
}

const Sidebar : FC<SidebarProps>= ({ onNewChat }) => {

  return (
    <div className="w-80 bg-slate-600 text-slate-50">
       <ul className="px-4 py-2 m-0">
          <li  id="newChat" className="newChat flex pl-4 py-5 font-semibold hover:bg-slate-400 focus:bg-indigo-100">
            <div className="flex bg-slate-500 rounded-xl pl-4 pr-12 py-1" onClick = { onNewChat }>
              <PlusIcon /> 
              <span>New Chat</span>
            </div>
          </li>
          <MenuItem 
            title="Manage My AI" 
            link="/managemyai" 
            itemList={["File1", "File2", "File3"]}
          />
          <MenuItem 
            title="Finetune AI Model" 
            link="/finetunemodel" 
            itemList={["My Model1", "MyModel2", "My Model3"]}
          />
          <MenuItem 
            title="Chat with AI" 
            link="/" 
            itemList={["Chat 1", "Chat 2", "Chat 3"]}
            defaultOpen={true}
          />
      </ul>
    </div>
  )
}

export default Sidebar
