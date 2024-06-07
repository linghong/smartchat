import { FC } from 'react'
import { FaBars, FaPlus } from 'react-icons/fa'
import { useRouter } from 'next/router'

interface HeaderProps {
  setIsSidebarOpen: (isSideBarOpen:boolean) => void
  isSidebarOpen: boolean
 }

const TopMenu : FC<HeaderProps> = ({  isSidebarOpen, setIsSidebarOpen }) => { 
  const router = useRouter();
  const pathName =router.pathname
 
  const pageCollection : { [key: string]: string}= {
    "/": "Chat With AI",
    "/finetunemodel": "Finetune AI Model",
    "/managemyai": "Manage RAG Files",  
  } 

  const onNewChat = () => {
    router.push('/')
  }

  const toggleSidebar = (e: any) => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <header className="w-full flex flx-col justify-between items-center bg-slate-400 py-1">       
      <div className="flex w-1/3 xs:w-36 sm:w-52 md:w-48 lg:w-52 xl:w-56 items-center justify-between  px-6 text-white text-md focus:bg-indigo-100">
        <button onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <FaBars size={20} />
        </button>
        <button onClick={onNewChat} aria-label="New Chat">
          <FaPlus size={20} />
        </button>
      </div>        
      <div className="flex flex-grow items-center justify-center  text-white text-md font-bold focus:bg-indigo-100 mx-auto">    
         <div className="text-xl font-bold text-center text-32xl">
          <h1>{ pageCollection[pathName] }</h1>
        </div>
      </div>
    </header>
  )
}

export default TopMenu
