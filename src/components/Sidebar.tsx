import React, { FC } from 'react'
import MenuItem from './MenuItem'
import PlusIcon from './PlusIcon'
import { useRouter } from 'next/router'

interface SidebarProps {
  onNewChat: () => void;
}

const Sidebar : FC<SidebarProps>= () => {
  const router = useRouter()
  const onNewChat = () => {
    router.push('/')
  };

  return (
    <div className="w-80 bg-slate-600 text-slate-50">
       <ul className="px-2  py-5 mr-4">
          <li  id="newChat" className="flex justify-center p-2 py-1 font-semibold hover:bg-slate-400 hover:rounded focus:bg-indigo-100">
            <div id="newChatDiv" className="flex w-full justify-center px-5 py-2 bg-slate-500 rounded-xl" onClick = { onNewChat }>
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
