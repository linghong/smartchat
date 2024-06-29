import React, { FC } from 'react'
import MenuItem from './MenuItem'

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}

const Sidebar : FC<SidebarProps>= ({isSidebarOpen, setIsSidebarOpen}) => {

  return (
    <div className="bg-slate-500 text-slate-50 h-full w-full xs:w-60 sm:w-80 md:w-72 lg:w-56 xl:w-56">
       <ul className="px-2  py-5 ">
          <MenuItem 
            title="Manage My AI" 
            link="/managemyai" 
            itemList={["File1", "File2", "File3"]}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <MenuItem 
            title="Finetune AI Model" 
            link="/finetunemodel" 
            itemList={["My Model1", "MyModel2", "My Model3"]}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <MenuItem 
            title="Chat with AI" 
            link="/" 
            itemList={["Chat 1", "Chat 2", "Chat 3"]}
            setIsSidebarOpen={setIsSidebarOpen}
            defaultOpen={true}
          />
      </ul>
    </div>
  )
}

export default Sidebar
