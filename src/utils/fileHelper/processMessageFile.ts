import { FileData, ImageFile } from '@/src/types/chat';
import { convertFileToText } from '@/src/utils/fileHelper/extractTextFromFile';

export const processImageFiles = (fileSrc: FileData[]) => {
  let base64ImageSrc: ImageFile[] = [];

  fileSrc.map((fileData: FileData) => {
    if (fileData.type.startsWith('image/')) {
      const { type, base64Content } = fileData;
      base64ImageSrc.push({
        ...fileData,
        base64Image: base64Content.split(',')[1],
        mimeType: type
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
