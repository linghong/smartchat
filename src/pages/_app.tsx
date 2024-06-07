import { useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Layout from '@/src/components/Layout'
import '@/src/styles/globals.css'

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [isNewChat, setIsNewChat] = useState(false)

  return (
    <>
      <Head>
        <meta 
          name="viewport" content="width=device-width, initial-scale=1.0"
        />
      </Head>
      <Layout>
        <Component {...pageProps} isNewChat={isNewChat} setIsNewChat={setIsNewChat}/>
      </Layout>
    </>  
  )
}

export default MyApp