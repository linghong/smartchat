import { getNamespaces } from '@/src/services/pineconeClient'
import { PINECONE_INDEX_NAME } from '@/config/env'

export const fetchNamespaces = async () => {
 
  try {
    if (!PINECONE_INDEX_NAME) {
      console.error('Missing Pinecone index name')
      return []
    }
    const namespaces = await getNamespaces(PINECONE_INDEX_NAME)
    
    return namespaces
    
  } catch (error) {
    console.error(`Error fetching namespaces:`, error)
    return []
  }
}
