import { useState, useEffect, FC, ReactNode } from 'react';

import Footer from '@/src/components/Footer';
import Header from '@/src/components/Header';
import Sidebar from '@/src/components/Sidebar';
interface LayoutProps {
  children: ReactNode;
  isPanelVisible: boolean;
  setIsPanelVisible: (isPanelVisible: boolean) => void;
}

const Layout: FC<LayoutProps> = ({
  children,
  isPanelVisible,
  setIsPanelVisible
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
        isPanelVisible={isPanelVisible}
        setIsPanelVisible={setIsPanelVisible}
      />
      <div className="flex flex-row w-full h-full">
        {isMobile && isSidebarOpen && (
          <div className="bg-slate-500 text-slate-50 h-full w-full">
            <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
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
            <div className="bg-slate-500 text-slate-50 h-full text-md xs:w-4/12 md:w-3/12 lg:w-2/12 fixed top-0 left-0 bottom-0">
              <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
            </div>
            <div className="flex flex-col w-full xs:pl-[33.33%] md:pl-[25%] lg:pl-[16.67%] items-center">
              <main className={`flex flex-col h-full  w-full max-w-4xl`}>
                <div className="flex-grow">{children}</div>
                <Footer />
              </main>
            </div>
          </div>
        )}
        {!isMobile && !isSidebarOpen && (
          <main className="flex flex-col w-full lg:w-70vw mx-auto h-full">
            {children}
            <Footer />
          </main>
        )}
      </div>
    </div>
  );
};

export default Layout;
