import { useState, useEffect, FC, ReactNode } from 'react';

import Footer from '@/src/components/Footer';
import Header from '@/src/components/Header';
import Sidebar from '@/src/components/Sidebar';
import { Message, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

interface LayoutProps {
  children: ReactNode;
  isConfigPanelVisible: boolean;
  setIsConfigPanelVisible: (isConfigPanelVisible: boolean) => void;
  namespacesList: OptionType[] | null;
  chatId: string;
  setChatId: (chatId: string) => void;
  setChatHistory: (chatHistory: Message[]) => void;
  setImageSrcHistory: (ImageSrcHistory: ImageFile[][]) => void;
}

const Layout: FC<LayoutProps> = ({
  children,
  isConfigPanelVisible,
  setIsConfigPanelVisible,
  namespacesList,
  chatId,
  setChatId,
  setChatHistory,
  setImageSrcHistory
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 480);
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
        isConfigPanelVisible={isConfigPanelVisible}
        setIsConfigPanelVisible={setIsConfigPanelVisible}
      />
      <div className="flex flex-row w-full h-full">
        {isMobile && isSidebarOpen && (
          <div className="bg-slate-500 text-slate-50 h-full w-full">
            <Sidebar
              setIsSidebarOpen={setIsSidebarOpen}
              namespacesList={namespacesList}
              chatId={chatId}
              setChatId={setChatId}
              setChatHistory={setChatHistory}
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
          <div className="flex flex-row w-full h-full">
            <div className="bg-slate-500 text-slate-50 h-full text-md w-full xs:w-56 xl:w-64 2xl:w-72 fixed top-0 left-0 bottom-0 z-10">
              <Sidebar
                setIsSidebarOpen={setIsSidebarOpen}
                namespacesList={namespacesList}
                chatId={chatId}
                setChatId={setChatId}
                setChatHistory={setChatHistory}
                setImageSrcHistory={setImageSrcHistory}
                setIsConfigPanelVisible={setIsConfigPanelVisible}
              />
            </div>
            <div className="flex flex-col w-full ml-56 xl:ml-64 2xl:ml-72">
              <main
                className={`flex flex-col h-full w-full max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8`}
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
    </div>
  );
};

export default Layout;
