import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { pineconeClient, checkIndexExists, createPineconeIndex } from './pineconeClient'
import loadAndSplit from '../utils/pdfLoadAndSplit'

const ingestDataToPinecone = async (filePath: string, nameSpace: string, indexName: string) => {
  try {
    console.log('split files...') 
    const chunks = await loadAndSplit(filePath)
    if(!chunks || chunks.length === 0) {
      console.error('No Chunks returned.')
      return
    }
    
    const isIndexExsited = await checkIndexExists(indexName)
    if (!isIndexExsited){
        await createPineconeIndex(pineconeClient, indexName)
    }

    console.log('creating embeddings...')
    const embeddings = new OpenAIEmbeddings()    
    
    console.log('embedding chunks to pinecone...')
    const index = pineconeClient.Index(indexName)

    await PineconeStore.fromDocuments(chunks, embeddings, {
      pineconeIndex: index,
      namespace: nameSpace,
      textKey: 'text',
    })

  } catch (error) {
    console.error('error', error)
    throw new Error('Failed to ingest your data')
  }
};

export default ingestDataToPinecone;

