import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

import {
  pineconeClient,
  checkIndexExists,
  createPineconeIndex
} from '@/src/services/rag/pineconeClient';
import loadAndSplit from '@/src/utils/pdfLoadAndSplit';

const ingestDataToPinecone = async (
  filePath: string,
  namespace: string,
  indexName: string,
  chunkSize: number,
  chunkOverlap: number
) => {
  try {
    console.log('Split files...');
    const chunks = await loadAndSplit(filePath, chunkSize, chunkOverlap);

    if (!chunks || chunks.length === 0) {
      console.error('No Chunks returned.');
      return;
    }

    const isIndexExsited = await checkIndexExists(indexName);
    if (!isIndexExsited) {
      await createPineconeIndex(pineconeClient, indexName);
    }

    console.log('Creating embeddings...');
    const embeddings = new OpenAIEmbeddings();

    console.log('Embedding chunks to Pinecone...');
    const index = pineconeClient.Index(indexName);
    await PineconeStore.fromDocuments(chunks, embeddings, {
      pineconeIndex: index,
      namespace: namespace,
      textKey: 'text'
    });
    console.log('Embedding completed');
  } catch (error) {
    console.error('error', error);
    throw new Error('Failed to ingest your data');
  }
};

export default ingestDataToPinecone;
