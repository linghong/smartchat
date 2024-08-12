import {
  useState,
  useEffect,
  FC,
  ReactNode,
  Dispatch,
  SetStateAction
} from 'react';

import Footer from '@/src/components/Footer';
import Header from '@/src/components/Header';
import Sidebar from '@/src/components/Sidebar';
import { Message, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

interface LayoutProps {
  children: ReactNode;
  isConfigPanelVisible: boolean;
  setIsConfigPanelVisible: Dispatch<SetStateAction<boolean>>;
  namespacesList: OptionType[] | null;
  setSelectedModel: Dispatch<SetStateAction<OptionType>>;
  chatId: string;
  setChatId: Dispatch<SetStateAction<string>>;
  chats: OptionType[];
  setChats: Dispatch<SetStateAction<OptionType[]>>;
  setChatHistory: Dispatch<SetStateAction<Message[]>>;
  setImageSrcHistory: Dispatch<SetStateAction<ImageFile[][]>>;
}

const Layout: FC<LayoutProps> = ({
  children,
  isConfigPanelVisible,
  setIsConfigPanelVisible,
  namespacesList,
  setSelectedModel,
  chatId,
  setChatId,
  chats,
  setChats,
  setChatHistory,
  setImageSrcHistory
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
    <div className="flex flex-col w-full h-screen">
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setSelectedModel={setSelectedModel}
        isConfigPanelVisible={isConfigPanelVisible}
        setIsConfigPanelVisible={setIsConfigPanelVisible}
        setChatId={setChatId}
        setChatHistory={setChatHistory}
        setImageSrcHistory={setImageSrcHistory}
      />

      {isMobile && isSidebarOpen && (
        <div className="bg-slate-500 text-slate-50 h-full w-full">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            namespacesList={namespacesList}
            chatId={chatId}
            setChatId={setChatId}
            setChatHistory={setChatHistory}
            chats={chats}
            setChats={setChats}
            setImageSrcHistory={setImageSrcHistory}
            setIsConfigPanelVisible={setIsConfigPanelVisible}
          />
        </div>
      )}
      {isMobile && !isSidebarOpen && (
        <main className="flex flex-col w-full lg:w-70vw h-full px-2">
          {children}
          <Footer />
        </main>
      )}
      {!isMobile && isSidebarOpen && (
        <div className="flex flex-row w-full h-full overflow-hidden">
          <div className="flex-shrink-0 bg-slate-500 text-slate-50 h-full text-md w-full sm:w-40 md:w-48 lg:w-52 xl:w-64 2xl:w-72 z-10">
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              namespacesList={namespacesList}
              chatId={chatId}
              setChatId={setChatId}
              chats={chats}
              setChats={setChats}
              setChatHistory={setChatHistory}
              setImageSrcHistory={setImageSrcHistory}
              setIsConfigPanelVisible={setIsConfigPanelVisible}
            />
          </div>
          <div className="relative flex flex-col w-full h-full max-w-full flex-1 overflow-hidden">
            <main
              className={`flex flex-col h-full w-full lg:w-9/12 xl:w-8/12 max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8`}
            >
              <div className="flex-grow">{children}</div>
              <Footer />
            </main>
          </div>
        </div>
      )}
      {!isMobile && !isSidebarOpen && (
        <main className="flex flex-col h-full w-full lg:w-70vw px-2 mx-auto">
          {children}
          <Footer />
        </main>
      )}
    </div>
  );
};

export default Layout;
