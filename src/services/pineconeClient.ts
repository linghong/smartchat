import { Pinecone, IndexStatsNamespaceSummary, IndexModel } from '@pinecone-database/pinecone'

const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT
const PINECONE_API_KEY = process.env.PINECONE_API_KEY
if (!PINECONE_ENVIRONMENT) throw new Error('missing Pinecone environment variable')
if (!PINECONE_API_KEY) throw new Error('missing Pinecone api key')

const initPinecone = async () => {
  console.log('Initiating Pinecone ...')
 
  try {
    const pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY
    });
   
    return pinecone

  } catch (e) {
    throw new Error('Error occurred while initializing the Pinecone client.')
  }
}

export const pineconeClient = await initPinecone()

export const createPineconeIndex = async (pineconeClient : Pinecone, indexName: string) => {
  try{
    console.log(`Creating index ${indexName}...`)
    const res = await pineconeClient.createIndex({
        name: indexName,
        dimension: 1536,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      },
    )
  } catch (error) {
    console.error(`An error occurred while creating the index: ${error}`)
    throw error
  }
}

export const listIndexes = async (): Promise<IndexModel[] | undefined> => {
  try {
      const indexes = await pineconeClient.listIndexes()
      return indexes.indexes

  } catch (error) {
      console.error(`An error occurred when listing index: ${error}`)
      return undefined
  }
}

export const checkIndexExists = async (indexName : string) : Promise<boolean> => {
  try {
      const response = await pineconeClient.describeIndex(indexName)
      
      if(response?.status?.state === 'Ready') {
        console.log(`Index ${indexName} exists.`)
        return true
    } else {
        console.log(`Index ${indexName} does not exist.`)
        return false
    }
  } catch (error) {
      console.error(`Failed to check if index exists: ${error}`)
      return false
  }
}

export const getNamespaces = async (indexName: string): Promise<string[] | undefined> => {
  try {
    const index = pineconeClient.Index(indexName)
    const res = await index.describeIndexStats()

    const namespacesObj: {[key: string]:IndexStatsNamespaceSummary} | undefined = res.namespaces

    return namespacesObj? Object.keys(namespacesObj) : undefined

  } catch (error) {
    console.error(`An error occurred when fetching namespaces: ${error}`)
    return undefined
  }
}










