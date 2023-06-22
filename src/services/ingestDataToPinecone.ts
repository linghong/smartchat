import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { pineconeClient } from './pineconeClient'
import loadAndSplit from '../utils/pdfLoadAndSplit'

const ingestDataToPinecone = async (filePath: string, nameSpace: string, indexName: string) => {
  try {
    console.log('split files...');  
    const chunks = await loadAndSplit(filePath)
    if(!chunks || chunks.length === 0) {
      console.error('No Chunks returned.')
      return;
    }
    console.log('creating vector store...')

    const embeddings = new OpenAIEmbeddings()
    const index = pineconeClient.Index(indexName)

    //embed the PDF documents
    await PineconeStore.fromDocuments(chunks, embeddings, {
      pineconeIndex: index,
      namespace: nameSpace,
      textKey: 'text',
    })

  } catch (error) {
    console.error('error', error);
    throw new Error('Failed to ingest your data')
  }
};

export default ingestDataToPinecone;

//the below lines are for manual testing during development
//const filePath = 'docs/form1040i.pdf'
//const indexName = process.env.PINECONE_INDEX_NAME ?? ''
//const nameSpace = 'test'; 
//await ingestDataToPinecone(filePath, nameSpace,indexName )
