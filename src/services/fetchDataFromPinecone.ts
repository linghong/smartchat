import { pineconeClient } from './pineconeClient'
interface Metadata {
  'loc.lines.from'?: number;
  'loc.lines.to'?: number;
  'loc.pageNumber'?: number;
  'pdf.info.CreationDate'?: string;
  'pdf.info.Creator'?: string;
  'pdf.info.IsAcroFormPresent'?: boolean;
  'pdf.info.IsXFAPresent'?: boolean;
  'pdf.info.PDFFormatVersion'?: string;
  'pdf.info.Producer'?: string;
  'pdf.totalPages'?: number;
  'pdf.version'?: string;
  source?: string;
  text?: string;
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME
if (! PINECONE_INDEX_NAME) throw new Error('Missing Pinecone index name')

export const fetchDataFromPinecone = async (embeddedQuery: number[], nameSpace: string) => {

  if (!Array.isArray(embeddedQuery) || embeddedQuery.length === 0) {
    throw new Error('Invalid or empty query vector provided.')
  }

  const index = pineconeClient.Index(PINECONE_INDEX_NAME)
  if (!index) {
    throw new Error('Unable to fetch Pinecone index');
  }

  const queryRequest = {
    vector: embeddedQuery,
    topK: 1,
    includeValues: true,
    includeMetadata: true,
    namespace: nameSpace,
  }

  let queryResponse 
  try{
    queryResponse = await index.query({ queryRequest }) 
    //console.log('Query Response:', queryResponse?.matches?.[0]?.metadata?.text)
  } catch (error) {
    throw new Error(`Failed to fetch data from Pinecone: ${error.message}`)
  }

  if (!queryResponse?.matches || queryResponse?.matches?.length === 0) {
    throw new Error('No matches found');
  }

  const message = queryResponse.matches.reduce((sum, match) => {
    const text = match.metadata?.text?? ''

    return sum + '\n' + text
  }, '')
  return message
}