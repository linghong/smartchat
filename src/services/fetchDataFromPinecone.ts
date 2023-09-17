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
 
  const index = pineconeClient.Index(PINECONE_INDEX_NAME)
  const queryRequest = {
    vector: embeddedQuery,
    topK: 1,
    includeValues: true,
    includeMetadata: true,
    namespace: nameSpace,
  }
  let queryResponse = await index.query({ queryRequest })

  if (queryResponse && queryResponse.matches) {
    const message = queryResponse.matches.reduce((sum, match) => {
      const metaData : Metadata | undefined = match.metadata
      const text = metaData?.text?? ''

      return sum + '\n' + text
    }, '')
    return message
  } else {
    throw new Error('Something went wrong when fetching data from pinecone')
  }
}