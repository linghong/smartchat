import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Layout from '@/src/components/Layout';
import FullPageLayout from '@/src/components/FullPageLayout';
import { isTokenExpired } from '@/src/components/WithAuth'

import '@/src/styles/globals.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [namespacesList, setNamespacesList] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token || isTokenExpired(token)) {
        setIsAuthenticated(false);
        if (router.pathname !== '/login') {
          router.push('/login');
        }
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; 
  }

  const isFullPagePage = router.pathname === '/login';

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {isFullPagePage || !isAuthenticated ? (
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