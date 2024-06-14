import React, { FC } from 'react'

import MenuItem from './MenuItem'

interface SidebarProps {
  setIsSidebarOpen: (isSidebarOpen: boolean) => void
  messageSubjectList: string[]
}

const Sidebar: FC<SidebarProps> = ({
  setIsSidebarOpen,
  messageSubjectList,
}) => {
  return (
    <div className="bg-slate-500 text-slate-50 h-full w-full xs:w-60 sm:w-80 md:w-72 lg:w-56 xl:w-56">
      <ul className="px-2  py-5 ">
        <MenuItem
          key="embedragfile"
          title="Embed RAG File"
          link="/embedragfile"
          itemList={['File 1', 'File 2', 'File 3']}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <MenuItem
          key="finetunemodel"
          title="Finetune AI Model"
          link="/finetunemodel"
          itemList={['My Model1', 'My Model2', 'My Model3']}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <MenuItem
          key="chatwithai"
          title="Chat With AI"
          link="/"
          itemList={[messageSubjectList[0]]}
          setIsSidebarOpen={setIsSidebarOpen}
          defaultOpen={true}
        />
      </ul>
    </div>
  )
}

export default Sidebar
