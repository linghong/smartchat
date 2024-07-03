import { useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import Layout from '@/src/components/Layout';

import '@/src/styles/globals.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [isNewChat, setIsNewChat] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Layout
        isPanelVisible={isPanelVisible}
        setIsPanelVisible={setIsPanelVisible}
      >
        <Component
          {...pageProps}
          isNewChat={isNewChat}
          setIsNewChat={setIsNewChat}
          isPanelVisible={isPanelVisible}
          setIsPanelVisible={setIsPanelVisible}
        />
      </Layout>
    </>
  );
};

export default MyApp;
