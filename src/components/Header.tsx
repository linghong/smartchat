import {
  useState,
  useEffect,
  FC,
  MouseEvent,
  Dispatch,
  SetStateAction
} from 'react';
import { Menu, SquarePen, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';

import SignOut from '@/src/components/SignOut';
import { useChatContext } from '@/src/context/ChatContext';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const Header: FC<HeaderProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const router = useRouter();
  const pathName = router.pathname;

  const pageCollection: { [key: string]: string } = {
    '/': 'Chat With My AI Assistant',
    '/finetunemodel': 'Finetune AI Model',
    '/embedragfile': 'Embed RAG File'
  };
  const {
    isNewChat,
    setIsNewChat,
    isConfigPanelVisible,
    setIsConfigPanelVisible
  } = useChatContext();

  const [isLoggedOut, setIsLoggedOut] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (token) {
      setIsLoggedOut(false);
    } else {
      setIsLoggedOut(true);
    }
  }, [router]);

  const onNewChat = async () => {
    // await its completion to ensure that any state changes occur after navigating, so that the sidebar won't open before the navigation completes
    await router.push('/');
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false);
    }
    setIsNewChat(true);
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
          <Menu size={20} />
        </button>
        <button
          className="hover:text-lg hover:bg-stone-600 hover:font-bold transition-colors duration-200"
          onClick={onNewChat}
          aria-label="New Chat"
        >
          <SquarePen size={21} />
        </button>
      </div>
      <div className="flex text-white text-md font-bold focus:bg-indigo-100">
        {pageCollection[pathName]}
      </div>
      <div className="flex space-x-6">
        <button
          onClick={toggleConfigPanel}
          className="flex items-center px-2 space-x-2 rounded-full hover:bg-slate-500 transition-colors duration-200"
          aria-label={
            isConfigPanelVisible
              ? 'Hide AI Assistant Config'
              : 'Show AI Assistant Config'
          }
        >
          {isConfigPanelVisible ? (
            <EyeOff size={20} className="text-white" />
          ) : (
            <Eye size={20} className="text-white" />
          )}
          <span className="text-white text-sm sm:inline">
            {isConfigPanelVisible ? 'Hide' : 'Show'} Assistant Config
          </span>
        </button>
        {!isLoggedOut && <SignOut />}
      </div>
    </header>
  );
};

export default Header;
