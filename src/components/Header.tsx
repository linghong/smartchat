import { FC, MouseEvent } from 'react';
import {
  AiOutlineMenu,
  AiOutlineForm,
  AiOutlineEye,
  AiOutlineEyeInvisible
} from 'react-icons/ai';
import { useRouter } from 'next/router';

interface HeaderProps {
  setIsSidebarOpen: (isSideBarOpen: boolean) => void;
  isSidebarOpen: boolean;
  isConfigPanelVisible: boolean;
  setIsConfigPanelVisible: (isConfigPanelVisible: boolean) => void;
}

const Header: FC<HeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isConfigPanelVisible,
  setIsConfigPanelVisible
}) => {
  const router = useRouter();
  const pathName = router.pathname;

  const pageCollection: { [key: string]: string } = {
    '/': 'Chat With My AI Assistant',
    '/finetunemodel': 'Finetune AI Model',
    '/embedragfile': 'Embed RAG File'
  };

  const onNewChat = async () => {
    // await its completion to ensure that any state changes occur after navigating, so that the sidebar won't open before the navigation completes
    await router.push('/');
    if (window.innerWidth <= 480) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = (e: MouseEvent<HTMLButtonElement>) => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleConfigPanel = (e: MouseEvent<HTMLButtonElement>) => {
    setIsConfigPanelVisible(!isConfigPanelVisible);
  };

  return (
    <header className="w-full flex flx-col justify-between items-center bg-slate-400 p-2 z-50">
      <div className="flex w-1/3 xs:w-36 sm:w-52 md:w-48 lg:w-52 xl:w-56 items-center justify-between px-6 text-white text-md focus:bg-indigo-100">
        <button
          className={` transition-colors duration-200 ${isSidebarOpen ? 'bg-slate-500 hover:bg-slate-700 focus:bg-stone-600' : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          role="toogle"
        >
          <AiOutlineMenu size={20} />
        </button>
        <button
          className="hover:text-lg hover:bg-stone-600 hover:font-bold transition-colors duration-200"
          onClick={onNewChat}
          aria-label="New Chat"
        >
          <AiOutlineForm size={21} />
        </button>
      </div>
      <div className="flex text-white text-md font-bold focus:bg-indigo-100">
        {pageCollection[pathName]}
      </div>
      <button
        onClick={toggleConfigPanel}
        className="flex items-center space-x-2 rounded-full hover:bg-slate-500 transition-colors duration-200"
        aria-label={isConfigPanelVisible ? 'Hide Config' : 'Show Config'}
      >
        {isConfigPanelVisible ? (
          <AiOutlineEyeInvisible size={20} className="text-white" />
        ) : (
          <AiOutlineEye size={20} className="text-white" />
        )}
        <span className="text-white text-sm hidden sm:inline">
          {isConfigPanelVisible ? 'Hide' : 'Show'} AI Assistant Config
        </span>
      </button>
    </header>
  );
};

export default Header;
