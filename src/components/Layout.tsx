import { FC, ReactNode } from 'react'

const Header = () => {
  return <div>Header</div>
}

const Footer = () => {
  return <div>Footer</div>
}

const Layout: FC<{ children: ReactNode }>  = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />  
  </>
)

export default Layout


