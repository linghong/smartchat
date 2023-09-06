import { FC } from 'react'

interface HeaderProps {
  pageTitle: string
 }

const Header : FC<HeaderProps> = ({ pageTitle }) => { 
  return (
    <header className="text-2xl py-3 font-bold text-center">
      <h1>{ pageTitle }</h1>
    </header>
  )
}

export default Header
