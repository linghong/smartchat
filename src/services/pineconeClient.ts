import { PineconeClient } from '@pinecone-database/pinecone'

const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT
const PINECONE_API_KEY = process.env.PINECONE_API_KEY
if (!PINECONE_ENVIRONMENT) throw new Error('missing Pinecone environment variable')
if (!PINECONE_API_KEY) throw new Error('missing Pinecone api key');


const initPinecone = async () => {
  const pinecone = new PineconeClient();
  try {
    await pinecone.init({
      environment: PINECONE_ENVIRONMENT,
      apiKey: PINECONE_API_KEY,
    })
    return pinecone

  } catch (e) {
    throw new Error('Something wrong when initializing Pinecone client')
  }
}

export const pineconeClient = await initPinecone()


export const createPineconeIndex = async (pineconeClient : any, indexName: string) => {
  await pineconeClient.createIndex({
    createRequest: {
      name: indexName,
      dimension: 1536
    },
  })
}












