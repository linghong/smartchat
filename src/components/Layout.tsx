import { useState, useEffect, FC, ReactNode } from 'react';
import Sidebar from '@/src/components/Sidebar';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';

const Layout: FC<{ children: ReactNode; messageSubjectList: string[] }> = ({
  children,
  messageSubjectList,
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
      />
      <div className="flex flex-row w-full flex-grow h-full">
        {isMobile && isSidebarOpen && (
          <div className="bg-slate-500 text-slate-50 h-full w-full">
            <Sidebar
              setIsSidebarOpen={setIsSidebarOpen}
              messageSubjectList={messageSubjectList}
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
          <>
            <div className="bg-slate-500 text-slate-50 h-full  text-md xs:w-4/12 md:w-3/12 lg:w-2/12">
              <Sidebar
                setIsSidebarOpen={setIsSidebarOpen}
                messageSubjectList={messageSubjectList}
              />
            </div>
            <main className="flex flex-col w-full h-full xs:w-8/12 md:w-9/12 lg:w-10/12 items-center mx-auto h-full">
              {children}
              <Footer />
            </main>
          </>
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
