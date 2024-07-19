import { useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import Layout from '@/src/components/Layout';
import { OptionType } from '@/src/types/common';
import '@/src/styles/globals.css';
import { String } from 'aws-sdk/clients/cloudwatchevents';

const initialFileCategory: OptionType = { value: 'none', label: '1' };

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [isConfigPanelVisible, setIsConfigPanelVisible] = useState(true);
  const [namespacesList, setNamespacesList] = useState(null);
  const [chatId, setChatId] = useState<String | null>(null);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Layout
        isConfigPanelVisible={isConfigPanelVisible}
        setIsConfigPanelVisible={setIsConfigPanelVisible}
        namespacesList={namespacesList}
        chatId={chatId}
        setChatId={setChatId}
      >
        <Component
          {...pageProps}
          isConfigPanelVisible={isConfigPanelVisible}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
          setNamespacesList={setNamespacesList}
          chatId={chatId}
          setChatId={setChatId}
        />
      </Layout>
    </>
  );
};

export default MyApp;
