import { FC } from 'react'

interface HeaderProps {
  pageTitle: string
 }

const Header : FC<HeaderProps> = ({ pageTitle }) => { 
  return (
    <header className="text-2xl py-8 font-bold text-center text-3xl">
      <h1>{ pageTitle }</h1>
    </header>
  )
}

export default Header
