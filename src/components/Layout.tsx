import {
  useState,
  useEffect,
  FC,
  ReactElement,
  Dispatch,
  SetStateAction,
  cloneElement,
  ReactNode
} from 'react';
import { useRouter } from 'next/router';

import Footer from '@/src/components/Footer';
import Header from '@/src/components/Header';
import Sidebar from '@/src/components/Sidebar';
import { Message, FileData } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { initialMessage, defaultModel } from '@/src/utils/initialData';

interface LayoutProps {
  children: ReactElement;
  namespacesList: OptionType[] | null;
}

interface HomePageProps {
  isConfigPanelVisible: boolean;
  setIsConfigPanelVisible: Dispatch<SetStateAction<boolean>>;
  isSearchChat: boolean;
  fileSrcHistory: FileData[][];
  setFileSrcHistory: Dispatch<SetStateAction<FileData[][]>>;
  chatHistory: Message[];
  setChatHistory: Dispatch<SetStateAction<Message[]>>;
  chatId: string;
  setChatId: Dispatch<SetStateAction<string>>;
  chats: OptionType[];
  setChats: Dispatch<SetStateAction<OptionType[]>>;
  selectedModel: OptionType;
  setSelectedModel: Dispatch<SetStateAction<OptionType>>;
}

const Layout: FC<LayoutProps> = ({ children, namespacesList }) => {
  const [chats, setChats] = useState<OptionType[]>([]);
  const [chatId, setChatId] = useState<string>('0'); //chatId is '0', it is at NewChat status
  const [chatHistory, setChatHistory] = useState<Message[]>([initialMessage]);
  const [fileSrcHistory, setFileSrcHistory] = useState<FileData[][]>([[]]); //the first one is for Hi, how can I assist you?, so the fileSrc is []

  const [selectedModel, setSelectedModel] = useState<OptionType>(defaultModel);

  const [isConfigPanelVisible, setIsConfigPanelVisible] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchChat, setIsSearchChat] = useState(false);
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

  const router = useRouter();

  // Check if the current route is the homepage ("/")
  const isHomePage = router.pathname === '/';

  // Pass the prop only to the HomePage
  const childrenWithProps = isHomePage
    ? cloneElement(
        children as React.ReactElement,
        {
          isConfigPanelVisible,
          setIsConfigPanelVisible,
          isSearchChat,
          fileSrcHistory,
          setFileSrcHistory,
          chatHistory,
          setChatHistory,
          chatId,
          setChatId,
          chats,
          setChats,
          selectedModel,
          setSelectedModel
        } as HomePageProps
      )
    : children;

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Run on initial mount
    checkIsMobile();

    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return (
    <div className={`flex flex-col w-full h-screen `}>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setSelectedModel={setSelectedModel}
        isConfigPanelVisible={isConfigPanelVisible}
        setIsConfigPanelVisible={setIsConfigPanelVisible}
        setChatId={setChatId}
        setChatHistory={setChatHistory}
        setFileSrcHistory={setFileSrcHistory}
      />

      {isMobile && isSidebarOpen && (
        <div className="bg-slate-500 text-slate-50 h-full w-full">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isSearchChat={isSearchChat}
            setIsSearchChat={setIsSearchChat}
            namespacesList={namespacesList}
            chatId={chatId}
            setChatId={setChatId}
            setChatHistory={setChatHistory}
            chats={chats}
            setChats={setChats}
            setFileSrcHistory={setFileSrcHistory}
            setIsConfigPanelVisible={setIsConfigPanelVisible}
          />
        </div>
      )}
      {isMobile && !isSidebarOpen && (
        <main className="flex flex-col w-full lg:w-70vw h-full px-2">
          {childrenWithProps}
          <Footer />
        </main>
      )}
      {!isMobile && isSidebarOpen && (
        <div className="flex flex-row w-full h-full overflow-hidden">
          {
            <div className="flex-shrink-0 bg-slate-500 text-slate-50 h-full text-md w-full sm:w-40 md:w-48 lg:w-52 xl:w-64 2xl:w-72 z-10">
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isSearchChat={isSearchChat}
                setIsSearchChat={setIsSearchChat}
                namespacesList={namespacesList}
                chatId={chatId}
                setChatId={setChatId}
                chats={chats}
                setChats={setChats}
                setChatHistory={setChatHistory}
                setFileSrcHistory={setFileSrcHistory}
                setIsConfigPanelVisible={setIsConfigPanelVisible}
              />
            </div>
          }
          <div className="relative flex flex-col w-full h-full max-w-full flex-1 overflow-hidden">
            <main
              className={`flex flex-col h-full w-full lg:w-9/12 xl:w-8/12 max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8`}
            >
              <div className="flex-grow">{childrenWithProps}</div>
              <Footer />
            </main>
          </div>
        </div>
      )}
      {!isMobile && !isSidebarOpen && (
        <main className="flex flex-col h-full w-full lg:w-70vw px-2 mx-auto">
          {childrenWithProps}
          <Footer />
        </main>
      )}
    </div>
  );
};

export default Layout;
