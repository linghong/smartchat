import { useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'

import Layout from '@/src/components/Layout'
import '@/src/styles/globals.css'

const MyApp = ({ Component, pageProps }: AppProps) => {
  
  const [isNewChat, setIsNewChat] = useState(false)
  const [messageSubjectList, setMessageSubjectList] = useState<string[]>([])

  return (
    <>
      <Head>
        <meta 
          name="viewport" content="width=device-width, initial-scale=1.0"
        />
      </Head>
      <Layout 
        messageSubjectList={messageSubjectList} 
      >
        <Component 
          {...pageProps} 
          isNewChat={isNewChat} 
          setIsNewChat={setIsNewChat}
          messageSubjectList={messageSubjectList}
          setMessageSubjectList={setMessageSubjectList}
        />
      </Layout>
    </>  
  )
}

export default MyApp