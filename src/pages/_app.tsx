import { useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import Layout from '@/src/components/Layout';
import { OptionType } from '@/src/types/common';
import '@/src/styles/globals.css';

const initialFileCategory: OptionType = { value: 'none', label: '1' };

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [isConfigPanelVisible, setIsConfigPanelVisible] = useState(true);
  const [namespacesList, setNamespacesList] = useState(null);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Layout
        isConfigPanelVisible={isConfigPanelVisible}
        setIsConfigPanelVisible={setIsConfigPanelVisible}
        namespacesList={namespacesList}
      >
        <Component
          {...pageProps}
          isConfigPanelVisible={isConfigPanelVisible}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
          setNamespacesList={setNamespacesList}
        />
      </Layout>
    </>
  );
};

export default MyApp;
