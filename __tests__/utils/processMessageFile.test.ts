import { FileData, ImageFile } from '@/src/types/chat';
import { convertFileToText } from '@/src/utils/extractTextFromFile';

export const processImageFiles = (fileSrc: FileData[]) => {
  let base64ImageSrc: ImageFile[] = [];
  fileSrc.map((fileData: FileData) => {
    if (fileData.type.startsWith('image/')) {
      const { type, base64Content, size, name, width, height } = fileData;
      base64ImageSrc.push({
        base64Image: base64Content.split(',')[1],
        mimeType: type,
        size,
        name,
        width,
        height
      });
    }
  });
  return base64ImageSrc;
};

// Process non-image files
export const processNonMediaFiles = async (fileSrc: FileData[]) => {
  const nonMediaFiles = fileSrc.filter(
    fileData => !fileData.type.startsWith('image')
  );
  const fileTextArray = await Promise.all(
    nonMediaFiles.map(async (fileData: FileData) => {
      const fileText = await convertFileToText(fileData);
      return `${fileData.name}: \n${fileText} \n`;
    })
  );
  return fileTextArray.join('');
};

describe('processMessageFile', () => {
  it('should process image files correctly', () => {
    const fileSrc: FileData[] = [
      {
        name: 'image1.png',
        type: 'image/png',
        base64Content:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        size: 123,
        width: 100,
        height: 200
      }
    ];
    const expected: ImageFile[] = [
      {
        name: 'image1.png',
        base64Image:
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        mimeType: 'image/png',
        size: 123,
        width: 100,
        height: 200
      }
    ];
    const result = processImageFiles(fileSrc);
    expect(result).toEqual(expected);
  });

  it('should process non-media files correctly', async () => {
    const fileSrc: FileData[] = [
      {
        name: 'text1.txt',
        type: 'text/plain',
        base64Content: 'data:text/plain;base64,SGVsbG8gV29ybGQh',
        size: 456
      }
    ];
    const expected = 'text1.txt: \nHello World! \n';
    const result = await processNonMediaFiles(fileSrc);
    expect(result).toEqual(expected);
  });
});
