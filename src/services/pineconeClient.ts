import { PineconeClient } from '@pinecone-database/pinecone'

const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT
const PINECONE_API_KEY = process.env.PINECONE_API_KEY
if (!PINECONE_ENVIRONMENT) throw new Error('missing Pinecone environment variable')
if (!PINECONE_API_KEY) throw new Error('missing Pinecone api key');

const pineconeClient = new PineconeClient();
try {
  await pineconeClient.init({
    environment: PINECONE_ENVIRONMENT,
    apiKey: PINECONE_API_KEY,
  })
} catch (e) {
  throw new Error('Something wrong when initializing Pinecone client')
}

const createPineconeIndex = async (pineconeClient : any) => {
  await pineconeClient.createIndex({
    createRequest: {
      name: "example-index",
      dimension: 1536
    },
  })
}

export { pineconeClient, createPineconeIndex }

