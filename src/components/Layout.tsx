import { useState, useEffect, FC, ReactNode } from 'react'
import Sidebar from '@/src/components/Sidebar'
import Header from '@/src/components/Header'

const Footer = () => {
  return <footer className='py-3 text-center opacity-40'>Chatbot responses are AI-generated and may be inaccurate, so always verify critical information.</footer>
}

const Layout: FC<{ children: ReactNode, messageSubjectList:string[]}>  = ({ children, messageSubjectList }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
 
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 480)
    }

    // Run on initial mount
    checkIsMobile()

    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  return (
    <div className='flex flex-col h-screen' >
      <Header 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex flex-row">
        {isMobile && isSidebarOpen  && 
          <Sidebar 
            isSidebarOpen={isSidebarOpen}  
            setIsSidebarOpen={setIsSidebarOpen}
            messageSubjectList={messageSubjectList}
          />
        }
        {isMobile && !isSidebarOpen && 
          <main className="w-full lg:w-70vw ">
            {children}
            <Footer />  
          </main>
        }
        { !isMobile && isSidebarOpen && 
          <>
            <Sidebar 
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              messageSubjectList={messageSubjectList}
            />
            <main className="w-full sm:w-90vw lg:w-70vw justify-center items-center mx-auto">
              {children}
              <Footer />  
            </main>
          </>
        }
        {!isMobile && !isSidebarOpen &&  
          <main className="w-full lg:w-70vw mx-auto">
            {children}
            <Footer />  
          </main>
        }     
      </div>
    </div>
  )
}

export default Layout


