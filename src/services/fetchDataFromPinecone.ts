
import { pineconeClient } from './pineconeClient'
import { createEmbedding } from './openai'

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME
if (! PINECONE_INDEX_NAME) throw new Error('Missing Pinecone index name')

export const fetchDataFromPinecone = async (querryText: string, nameSpace: string) => {
  const embeddedQuerry = await createEmbedding(querryText)
  const index = pineconeClient.Index(PINECONE_INDEX_NAME)
  const queryRequest = {
    vector: embeddedQuerry,
    topK: 3,
    includeValues: true,
    includeMetadata: true,
    namespace: nameSpace,
  }
  try {
      let queryResponse = await index.query({ queryRequest })
      if (queryResponse && queryResponse.matches) {
        console.log('result', queryResponse.matches)
        return queryResponse.matches
      } else {
        console.log('Something went wrong when fetching data from pinecone')
        return null
      }
  } catch(e) {
    throw Error("Something went wrong when fetching from prinecone")
  }
}