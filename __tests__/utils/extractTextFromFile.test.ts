import { convertFileToText } from '@/src/utils/extractTextFromFile';
import { FileData } from '@/src/types/chat';
import * as mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import * as xlsx from 'xlsx';

// Mock the entire pdf-parse module
jest.mock('pdf-parse', () => jest.fn());
jest.mock('mammoth');
jest.mock('xlsx');

describe('convertFileToText', () => {
  const mockFileData: FileData = {
    base64Content: 'data:application/octet-stream;base64,SGVsbG8gV29ybGQ=',
    type: 'text/plain',
    size: 11,
    name: 'test.txt'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract text from plain text file', async () => {
    const result = await convertFileToText(mockFileData);
    expect(result).toBe('Hello World');
  });

  it('should extract text from PDF file', async () => {
    const pdfFileData: FileData = {
      ...mockFileData,
      type: 'application/pdf',
      base64Content: 'data:application/pdf;base64,cGRmQ29udGVudA=='
    };

    (pdfParse as jest.Mock).mockResolvedValue({ text: 'PDF Content' });

    const result = await convertFileToText(pdfFileData);
    expect(result).toBe('PDF Content');
    expect(pdfParse).toHaveBeenCalledWith(expect.any(Buffer));
  });

  it('should handle PDF parsing errors', async () => {
    const pdfFileData: FileData = {
      ...mockFileData,
      type: 'application/pdf',
      base64Content: 'data:application/pdf;base64,cGRmQ29udGVudA=='
    };

    (pdfParse as jest.Mock).mockRejectedValue(new Error('PDF parsing failed'));

    const result = await convertFileToText(pdfFileData);
    expect(result).toBe('PDF parsing failed');
  });

  it('should extract text from Office document', async () => {
    const docxFileData: FileData = {
      base64Content:
        'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,ZG9jQ29udGVudA==',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 100,
      name: 'test.docx'
    };

    (mammoth.extractRawText as jest.Mock).mockResolvedValue({
      value: 'DOCX Content'
    });

    const result = await convertFileToText(docxFileData);

    expect(result).toBe('DOCX Content');
    expect(mammoth.extractRawText).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should extract text from Excel sheet', async () => {
    const xlsxFileData: FileData = {
      ...mockFileData,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      base64Content:
        'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,eGxzeENvbnRlbnQ='
    };

    (xlsx.read as jest.Mock).mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} }
    });
    (xlsx.utils.sheet_to_csv as jest.Mock).mockReturnValue('XLSX Content');

    const result = await convertFileToText(xlsxFileData);
    expect(result).toBe('XLSX Content\n');
    expect(xlsx.read).toHaveBeenCalledWith(expect.any(Buffer), {
      type: 'buffer'
    });
    expect(xlsx.utils.sheet_to_csv).toHaveBeenCalledWith({});
  });

  it('should return "Unsupported file" for unsupported file types', async () => {
    const unsupportedFileData: FileData = {
      ...mockFileData,
      type: 'image/jpeg',
      base64Content: 'data:image/jpeg;base64,aW1hZ2VDb250ZW50'
    };

    const result = await convertFileToText(unsupportedFileData);
    expect(result).toBe('Unsupported file');
  });

  it('should handle errors during file processing', async () => {
    const errorFileData: FileData = {
      ...mockFileData,
      type: 'application/pdf',
      base64Content: 'data:application/pdf;base64,ZXJyb3JDb250ZW50'
    };

    (pdfParse as jest.Mock).mockRejectedValue(new Error('PDF parsing error'));

    const result = await convertFileToText(errorFileData);
    expect(result).toBe('PDF parsing error');
  });

  it('should handle JSON files', async () => {
    const jsonFileData: FileData = {
      ...mockFileData,
      type: 'application/json',
      base64Content: 'data:application/json;base64,eyJrZXkiOiJ2YWx1ZSJ9'
    };

    const result = await convertFileToText(jsonFileData);
    expect(result).toBe('{"key":"value"}');
  });

  it('should handle YAML files', async () => {
    const yamlFileData: FileData = {
      ...mockFileData,
      type: 'application/x-yaml',
      base64Content: 'data:application/x-yaml;base64,a2V5OiB2YWx1ZQ=='
    };

    const result = await convertFileToText(yamlFileData);
    expect(result).toBe('key: value');
  });

  it('should handle octet-stream files', async () => {
    const octetStreamFileData: FileData = {
      ...mockFileData,
      type: 'application/octet-stream',
      base64Content:
        'data:application/octet-stream;base64,b2N0ZXQtc3RyZWFtIGNvbnRlbnQ='
    };

    const result = await convertFileToText(octetStreamFileData);
    expect(result).toBe('octet-stream content');
  });
});
