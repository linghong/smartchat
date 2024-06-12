import { FC } from 'react'
import { AiOutlineMenu , AiOutlineForm } from 'react-icons/ai'
import { useRouter } from 'next/router'

interface HeaderProps {
  setIsSidebarOpen: (isSideBarOpen: boolean) => void
  isSidebarOpen: boolean
 }

const Header : FC<HeaderProps> = ({ isSidebarOpen, setIsSidebarOpen }) => { 
  const router = useRouter();
  const pathName =router.pathname
 
  const pageCollection : { [key: string]: string}= {
    "/": "Chat With AI",
    "/finetunemodel": "Finetune AI Model",
    "/embedragfile": "Embed RAG File",  
  } 

  const onNewChat = async () => {
    // await its completion to ensure that any state changes occur after navigating, so that the sidebar won't open before the navigation completes
    await router.push('/')
    if (window.innerWidth <= 480) {
      setIsSidebarOpen(false)
    }
  }

  const toggleSidebar = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <header className="w-full flex flx-col justify-between items-center bg-slate-400 pt-2 pb-1">       
      <div className="flex w-1/3 xs:w-36 sm:w-52 md:w-48 lg:w-52 xl:w-56 items-center justify-between px-6 text-white text-md focus:bg-indigo-100">
        <button 
          className={`${isSidebarOpen ?'bg-slate-500 hover:bg-slate-700 focus:bg-stone-600' : ''}`} onClick={toggleSidebar} 
          aria-label="Toggle Sidebar"
          role="toogle"
        >
          <AiOutlineMenu  size={20} />
        </button>
        <button 
          className="hover:text-lg hover:bg-stone-600 hover:font-bold" 
          onClick={onNewChat} 
          aria-label="New Chat"
        >
          <AiOutlineForm size={21} />
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

export default Header
