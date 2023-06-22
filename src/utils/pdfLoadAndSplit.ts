import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

const loadAndSplit  = async ( docPath :string)  => {
  try {
    const loader = new PDFLoader(docPath,  { splitPages: false })
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
      keepSeparator: false,
    })
    const documents = await loader.loadAndSplit(splitter)
    return documents

  } catch (e) {
    console.error("Failed to load or split Document.", e)
    throw new Error("Failed to load or split Document.")
  }
}

export  default loadAndSplit