import { PineconeClient } from '@pinecone-database/pinecone'

const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT
const PINECONE_API_KEY = process.env.PINECONE_API_KEY
if (!PINECONE_ENVIRONMENT) throw new Error('missing Pinecone environment variable')
if (!PINECONE_API_KEY) throw new Error('missing Pinecone api key');

const initPinecone = async () => {
  console.log('Initiating Pinecone ...')
  const pinecone = new PineconeClient();
  try {
    await pinecone.init({
      environment: PINECONE_ENVIRONMENT,
      apiKey: PINECONE_API_KEY,
    })
    return pinecone

  } catch (e) {
    throw new Error('Error occurred while initializing the Pinecone client.')
  }
}

export const pineconeClient = await initPinecone()

export const createPineconeIndex = async (pineconeClient : PineconeClient, indexName: string) => {
  try{
    console.log(`Creating index ${indexName}...`);
    const res = await pineconeClient.createIndex({
      createRequest: {
        name: indexName,
        dimension: 1536,
        metric: 'cosine'
      },
    })
  } catch (error) {
    console.error(`An error occurred while creating the index: ${error}`);
    throw error;
  }
}

export const listIndexes = async (): Promise<string[] | undefined> => {
  try {
      const indexes = await pineconeClient.listIndexes();
      return indexes;
  } catch (error) {
      console.error(`An error occurred when listing index: ${error}`);
      return undefined;
  }
}

export const checkIndexExists = async (indexName : string) : Promise<boolean> => {
  try {
      const response = await pineconeClient.describeIndex({ indexName: indexName });
      
      if(response?.status?.state === 'Ready') {
        console.log(`Index ${indexName} exists.`);
        return true;
    } else {
        console.log(`Index ${indexName} does not exist.`);
        return false;
    }
  } catch (error) {
      console.error(`Failed to check if index exists: ${error}`);
      return false;
  }
}

export const getNamespaces = async (indexName: string): Promise<string[] | undefined> => {
  try {
    const index = pineconeClient.Index(indexName)
    const res = await index.describeIndexStats({
      describeIndexStatsRequest: {}
    })
    
    const namespacesObj: {[key: string]: { vectorCount?: number | undefined }}  | undefined = res.namespaces

    return namespacesObj? Object.keys(namespacesObj) : undefined

  } catch (error) {
    console.error(`An error occurred when fetching namespaces: ${error}`);
    return undefined;
  }
}










