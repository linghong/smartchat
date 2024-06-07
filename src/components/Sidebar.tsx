import React, { FC } from 'react'
import MenuItem from './MenuItem'

const Sidebar : FC<{isSidebarOpen: boolean}>= () => {

  return (
    <div className="bg-slate-500 text-slate-50 h-full w-full xs-56 md:w-72 lg:w-56 xl:w-56">
       <ul className="px-2  py-5 ">
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
