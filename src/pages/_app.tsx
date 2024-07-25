import { useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import Layout from '@/src/components/Layout';
import { Message, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import '@/src/styles/globals.css';

const initialFileCategory: OptionType = { value: 'none', label: '1' };

export const initialMessage = {
  question: '',
  answer: 'Hi, how can I assist you?'
};

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [isConfigPanelVisible, setIsConfigPanelVisible] = useState(true);
  const [namespacesList, setNamespacesList] = useState(null);
  const [chatId, setChatId] = useState<string>('0'); //chatId is '0', it is at NewChat status
  const [chatHistory, setChatHistory] = useState<Message[]>([initialMessage]);
  const [imageSrcHistory, setImageSrcHistory] = useState<ImageFile[][]>([[]]); //the first one is for Hi, how can I assist you?, so the imageSrc is []

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
        setChatHistory={setChatHistory}
        setImageSrcHistory={setImageSrcHistory}
      >
        <Component
          {...pageProps}
          isConfigPanelVisible={isConfigPanelVisible}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
          setNamespacesList={setNamespacesList}
          chatId={chatId}
          setChatId={setChatId}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          imageSrcHistory={imageSrcHistory}
          setImageSrcHistory={setImageSrcHistory}
        />
      </Layout>
    </>
  );
};

export default MyApp;
