import { useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Layout from '@/src/components/Layout';
import FullPageLayout from '@/src/components/FullPageLayout';
import { Message, ImageFile } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';

import '@/src/styles/globals.css';
import { initialMessage, defaultModel } from '@/src/utils/initialData';

const initialFileCategory: OptionType = { value: 'none', label: '1' };

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const isFullPagePage = router.pathname === '/login';

  const [isConfigPanelVisible, setIsConfigPanelVisible] = useState(true);

  const [namespacesList, setNamespacesList] = useState(null);

  const [chatId, setChatId] = useState<string>('0'); //chatId is '0', it is at NewChat status
  const [chats, setChats] = useState<OptionType[]>([]);
  const [selectedModel, setSelectedModel] = useState<OptionType>(defaultModel);
  const [chatHistory, setChatHistory] = useState<Message[]>([initialMessage]);
  const [imageSrcHistory, setImageSrcHistory] = useState<ImageFile[][]>([[]]); //the first one is for Hi, how can I assist you?, so the imageSrc is []

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
        <Layout
          isConfigPanelVisible={isConfigPanelVisible}
          setIsConfigPanelVisible={setIsConfigPanelVisible}
          namespacesList={namespacesList}
          setSelectedModel={setSelectedModel}
          chatId={chatId}
          setChatId={setChatId}
          chats={chats}
          setChats={setChats}
          setChatHistory={setChatHistory}
          setImageSrcHistory={setImageSrcHistory}
        >
          <Component
            {...pageProps}
            isConfigPanelVisible={isConfigPanelVisible}
            setIsConfigPanelVisible={setIsConfigPanelVisible}
            setNamespacesList={setNamespacesList}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            chatId={chatId}
            setChatId={setChatId}
            setChats={setChats}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            imageSrcHistory={imageSrcHistory}
            setImageSrcHistory={setImageSrcHistory}
          />
        </Layout>
      )}
    </>
  );
};

export default MyApp;
