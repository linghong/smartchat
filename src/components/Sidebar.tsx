import React, { FC } from 'react'

import MenuItem from '@/src/components/MenuItem'

interface SidebarProps {
  setIsSidebarOpen: (isSidebarOpen: boolean) => void
  messageSubjectList: string[]
}

const Sidebar: FC<SidebarProps> = ({
  setIsSidebarOpen,
  messageSubjectList,
}) => {
  return (
    <ul className="px-2 py-5 ">
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
  )
}

export default Sidebar
