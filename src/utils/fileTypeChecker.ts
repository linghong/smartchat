import { ImageFile, FileData } from '@/src/types/chat';

export const fileType = (fileData: FileData) => {
  const { type } = fileData;
  if (type?.startsWith('image/')) return 'image';

  if (type === 'application/pdf') return 'pdf';

  if (type === 'application/json') return 'json';

  if (type === 'application/x-yaml') return 'yaml';

  //.ts, .tsx, .log, .go .c, .cpp, etc.
  if (type === 'application/octet-stream') return 'octet-stream';

  // text/markdown
  // text/plain
  // text/css
  // text/html
  // text/x-python-script
  // and more
  if (type.startsWith('text/')) return 'text';

  if (
    type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'office-document';

  if (
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return 'office-sheet';

  if (
    type ===
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  )
    return 'office-ppt';

  return 'not supported';
};
