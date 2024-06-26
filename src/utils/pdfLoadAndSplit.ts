/**
 * This PDF Loader and Splitter is designed to work with converted PDFs and is not compatible with PDFs generated from scanned documents.
 * Scanned documents will require separate handling due to their unique conditions.
 *
 * The Langchain PDFLoader used here appends a newline character at the end of each line during text extraction,
 * However, newline characters (\n) often do not coincide with the end of a sentence.
 * The goal of the regExpress code here is to mitigate this issue, though it may not entirely eliminate all related problems.
 *
 * Due to the complexity and variability of PDF file structures, particularly those with embedded tables, the current implementation is primarily targeted at handling non-tabular English-language text for a significantly better outcome than the original Langchain method.
 */
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

type Document = {
  pageContent: string;
  metadata: Record<string, any>;
};

const joinBrokenSentence = (pageContent: string): string => {
  // Handle words that got split between lines, or two words that are combined into one.
  let text = pageContent.replace(/-\n/g, '').replace(/\n-/g, '-');

  // Replaces newline characters that are part of numbered lists.
  text = text.replace(/(?<=^\b[0-9a-zA-Z]{1}\.|•)\n/gm, ' ');

  // Replace newline characters that less likely represent sentence boundaries.
  //This occurs when both the preceding characters are not typical sentence endings and the following characters do not typically start a sentence.
  //The '?' character is excluded from this process to prevent splitting potential answers.
  text = text.replace(
    /(?<![.!] *\)*|[.!]") *\n(?= *[a-z0-9!?:;,.@%&$ ])/g,
    ' '
  );

  return text;
};

const loadAndSplit = async (
  docPath: string,
  chunkSize: number,
  chunkOverlap: number
): Promise<Document[]> => {
  try {
    const loader = new PDFLoader(docPath, { splitPages: false });
    const document = await loader.load();

    const metadata: Record<string, any> = await document[0].metadata;

    const preparedText = joinBrokenSentence(document[0].pageContent);

    // The regex used as separators serves the following purposes:
    // 1.'(?<![.!] *\)*|[.!]")\n': split when newline characters that are more likely to be at the end of a sentence.
    // 2.'\n(?![?)}]|\])': split when newline characters not followed by a question mark and closing brackets - these are unlikely to be at the end of sentences.
    // 3.'(?<![.!] *|[.!]"|[.!] *) ': Matches spaces more likely to be at the end of a sentence -using the same criteria as the first pattern but for spaces instead of newline characters.
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      keepSeparator: true,
      separators: [
        '\n\n',
        '(?<![.!] *)*|[.!]")\n',
        '\n(?![?)}]|])',
        '(?<![.!] *|[.!]"|[.!] *) ',
        ' ',
        ''
      ]
    });

    const documents: Document[] = await splitter.createDocuments(
      [preparedText],
      [metadata]
    );

    return documents;
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to load or split document: ${e}`);
  }
};

export default loadAndSplit;
