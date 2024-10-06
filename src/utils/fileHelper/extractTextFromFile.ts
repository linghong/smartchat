/* functions for extracting text from a non-media file
 */
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import * as xlsx from 'xlsx'; // for XLSX parsing

import { FileData } from '@/src/types/chat';
import { fileType } from '@/src/utils/fileHelper/fileTypeChecker';

const extractTextFromFile = (base64String: string) => {
  return Buffer.from(base64String, 'base64').toString('utf-8');
};

const extractTextFromPDF = async (base64String: string): Promise<string> => {
  const pdfBuffer = Buffer.from(base64String, 'base64');

  try {
    const data = await pdfParse(pdfBuffer);
    if (!data || !data.text) {
      throw new Error('PDF parsing resulted in empty or invalid data');
    }

    return data.text; // Extracted text content from the PDF
  } catch (error) {
    console.error('Error extracting text from PDF:', error);

    if (error instanceof Error) {
      return error.message;
    }

    return 'An error occurred while extracting text from the PDF. Please ensure the file is not corrupted and try again.';
  }
};

const extractTextFromOfficeDoc = async (
  officeContent: string
): Promise<string> => {
  // back to binary form
  const dataBuffer = Buffer.from(officeContent, 'base64');

  try {
    const result = await mammoth.extractRawText({ buffer: dataBuffer });

    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    return 'Failed to extract text from DOCX';
  }
};

const extractTextFromOfficeSheet = async (
  officeContent: string
): Promise<string> => {
  const dataBuffer = Buffer.from(officeContent, 'base64');

  try {
    const workbook = xlsx.read(dataBuffer, { type: 'buffer' });
    let extractedText = '';
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      extractedText += xlsx.utils.sheet_to_csv(sheet) + '\n';
    });

    return extractedText;
  } catch (error) {
    console.error('Error extracting text from XLSX:', error);
    return 'Failed to extract text from XLSX';
  }
};

/**
 * Get the AI understand text from fileData.
 * @param fileData:{
 *  base64Content: string;
 *   type: string;
 *   size: number;
 *   name: string;
 *   width?: number;
 *   height?: number;
 * }
 * exclude image, audio and video files
 * @returns A text string that can be understood by Generative AI.
 */
export const convertFileToText = async (
  fileData: FileData
): Promise<string> => {
  const type: string = fileType(fileData);
  const { base64Content } = fileData;
  const base64String = base64Content.split(';base64,')[1];
  try {
    // .txt, .html, .js, .py, etc
    switch (type) {
      case 'text':
      case 'octet-stream':
      case 'json':
      case 'yaml':
        return extractTextFromFile(base64String);
      case 'pdf':
        return await extractTextFromPDF(base64String);
      case 'office-document':
        return await extractTextFromOfficeDoc(base64String);
      case 'office-sheet':
        return await extractTextFromOfficeSheet(base64String);
      default:
        return 'Unsupported file';
    }
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred while processing the file';
  }
};
