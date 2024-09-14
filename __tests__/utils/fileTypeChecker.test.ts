import { fileType } from '@/src/utils/fileTypeChecker';
import { FileData } from '@/src/types/chat';

describe('fileType', () => {
  it('should return "image" for image types', () => {
    const fileData: FileData = {
      base64Content: '',
      type: 'image/jpeg',
      size: 1024,
      name: 'image.jpg'
    };
    expect(fileType(fileData)).toBe('image');
  });

  it('should return "pdf" for PDF type', () => {
    const fileData: FileData = {
      base64Content: '',
      type: 'application/pdf',
      size: 2048,
      name: 'document.pdf'
    };
    expect(fileType(fileData)).toBe('pdf');
  });

  it('should return "json" for JSON type', () => {
    const fileData: FileData = {
      base64Content: '',
      type: 'application/json',
      size: 512,
      name: 'data.json'
    };
    expect(fileType(fileData)).toBe('json');
  });

  it('should return "yaml" for YAML type', () => {
    const fileData: FileData = {
      base64Content: '',
      type: 'application/x-yaml',
      size: 256,
      name: 'config.yaml'
    };
    expect(fileType(fileData)).toBe('yaml');
  });

  it('should return "octet-stream" for octet-stream type', () => {
    const fileData: FileData = {
      base64Content: '',
      type: 'application/octet-stream',
      size: 1024,
      name: 'file.bin'
    };
    expect(fileType(fileData)).toBe('octet-stream');
  });

  it('should return "text" for text types', () => {
    const fileData: FileData = {
      base64Content: '',
      type: 'text/plain',
      size: 128,
      name: 'notes.txt'
    };
    expect(fileType(fileData)).toBe('text');
  });

  it('should return "office-document" for Word document type', () => {
    const fileData: FileData = {
      base64Content: '',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 4096,
      name: 'document.docx'
    };
    expect(fileType(fileData)).toBe('office-document');
  });

  it('should return "office-sheet" for Excel sheet type', () => {
    const fileData: FileData = {
      base64Content: '',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 8192,
      name: 'spreadsheet.xlsx'
    };
    expect(fileType(fileData)).toBe('office-sheet');
  });

  it('should return "office-ppt" for PowerPoint presentation type', () => {
    const fileData: FileData = {
      base64Content: '',
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 16384,
      name: 'presentation.pptx'
    };
    expect(fileType(fileData)).toBe('office-ppt');
  });

  it('should return "not supported" for unsupported types', () => {
    const fileData: FileData = {
      base64Content: '',
      type: 'application/unknown',
      size: 0,
      name: 'unknown.file'
    };
    expect(fileType(fileData)).toBe('not supported');
  });
});
