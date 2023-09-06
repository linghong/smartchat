import { useState } from 'react'
import type { AppProps } from 'next/app'
import Layout from '@/src/components/Layout'
import '@/src/styles/globals.css'

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [isNewChat, setIsNewChat] = useState(false)

  const handleNewChat = () => {
    setIsNewChat(true)
  }

  return (
    <Layout onNewChat={handleNewChat}>
      <Component {...pageProps} isNewChat={isNewChat}/>
    </Layout>
  )
}

export default MyApp