/**
 * This PDF Loader and Splitter is designed to work with converted PDFs and is not compatible with PDFs generated from scanned documents. 
 * Scanned documents will require separate handling due to their unique conditions.
 *
 * The Langchain PDFLoader used here, which utilizes the PDF loading functionality from the pdf.js library, appends a newline character at the end of each line during text extraction 
 * However, newline characters (\n) often do not coincide with the end of a sentence. 
 * The goal of this code is to mitigate this issue, though it may not entirely eliminate all related problems.
 *
 * Due to the complexity and variability of PDF file structures, particularly those with embedded tables, the current implementation is primarily targeted at handling non-tabular English-language text for  a significantly better outcome than the original Langchain code.
 */
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

const loadAndSplit  = async ( docPath :string)  => {
  try {
    const loader = new PDFLoader(docPath,  { splitPages: false})
    const document = await loader.load()
        
    const metadata = document[0].metadata

    // Handle words that got split between lines, or two words that are combined into one.
    const text1 = document[0].pageContent.replace(/-\n/g, '').replace(/\n-/g, '-')

    // When a period exists before a newline character (\n), it could be part of a numbered list (like 1.Item1, 2.Item2, etc.).
    // In such cases, we want to replace the newline character with a space, effectively joining the split items onto the same line.
    const text2 = text1.replace(/(?<=^\b[0-9a-zA-Z]{1}\.|•)\n/gm, ' ')

    // when a line doesn't end with .(including ...), ! (including ?!), .", !", .), !) or !") or ."), it is less likely to be the end of a sentence.
    // As we may want the answer, we avoid moving it to a newline. Therefore, '?' is not included in the above sentence-ending conditions.
    // If such a line is followed by a character that is more likely to be connected to the previous sentence,
    // remove the newline ("\n") and replace it with a space (" ").
    const text = text2.replace(/(?<![.!] *\)*|[.!]") *\n(?= *[a-z0-9!?:;,.@%&$ ])/g, ' ')

    // The regex used as separators serves the following purposes:
    // 1.'(?<![.!] *\)*|[.!]")\n': split when newline characters that are more likely to be at the end of a sentence. 
    // 2.'\n(?![?)}]|\])': split when newline characters not followed by a question mark and closing brackets - these are unlikely to be at the end of sentences.
    // 3.'(?<![.!] *|[.!]"|[.!] *) ': Matches spaces more likely to be at the end of a sentence -using the same criteria as the first pattern but for spaces instead of newline characters.
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200, 
      keepSeparator: true,
      separators: ['\n\n','(?<![.!] *\)*|[.!]")\n', '\n(?![?)}]|\])', '(?<![.!] *|[.!]"|[.!] *) ', ' ', '']
    })

    const documents = await splitter.createDocuments([text], [metadata])
    return documents
    
  } catch (e) {
    console.error("Failed to load or split Document.", e)
    throw new Error("Failed to load or split Document.")
  }
}

export  default loadAndSplit