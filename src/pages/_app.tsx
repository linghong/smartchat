import { useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Layout from '@/src/components/Layout';
import FullPageLayout from '@/src/components/FullPageLayout';
import { OptionType } from '@/src/types/common';

import '@/src/styles/globals.css';

const initialFileCategory: OptionType = { value: 'none', label: '1' };

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const isFullPagePage = router.pathname === '/login';
  const [namespacesList, setNamespacesList] = useState(null);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {isFullPagePage ? (
        <FullPageLayout>
          <Component {...pageProps} />
        </FullPageLayout>
      ) : (
        <Layout namespacesList={namespacesList}>
          <Component {...pageProps} setNamespacesList={setNamespacesList} />
        </Layout>
      )}
    </>
  );
};

export default MyApp;
