import {
  blobToFile,
  fileToBase64,
  fetchImageAsBase64,
  getImageDimensions
} from '@/src/utils/fileFetchAndConversion';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    blob: () =>
      Promise.resolve(new Blob(['image content'], { type: 'image/png' }))
  } as Response)
);

// Mock the Image object
beforeAll(() => {
  jest.spyOn(global, 'Image').mockImplementation(() => {
    const img = document.createElement('img');
    Object.defineProperty(img, 'onload', {
      set: callback => {
        setTimeout(() => {
          Object.defineProperty(img, 'width', { value: 1 });
          Object.defineProperty(img, 'height', { value: 1 });
          callback({} as Event); // Call the onload event with a mock Event object
        }, 0);
      }
    });
    return img;
  });
});

describe('fileFetchAndConversion', () => {
  describe('blobToFile', () => {
    it('should convert a Blob to a File object', () => {
      const blob = new Blob(['test content'], { type: 'text/plain' });
      const file = blobToFile(blob, 'test.txt');

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test.txt');
      expect(file.type).toBe('text/plain');
    });
  });

  describe('fileToBase64', () => {
    it('should convert a File to a base64 string', async () => {
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain'
      });
      const base64 = await fileToBase64(file);

      expect(base64).toMatch(/^data:text\/plain;base64,/);
    });
  });

  describe('fetchImageAsBase64', () => {
    it('should fetch an image and convert it to a base64 string', async () => {
      const base64 = await fetchImageAsBase64('https://example.com/image.png');

      expect(base64).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('getImageDimensions', () => {
    it('should get the dimensions of an image from a base64 string', async () => {
      const base64Image =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACklEQVR42mP8/wcAAgUBAXkGKD8AAAAASUVORK5CYII='; // 1x1 pixel PNG
      const { width, height } = await getImageDimensions(base64Image);

      expect(width).toBe(1);
      expect(height).toBe(1);
    }, 10000); // Increase the timeout to 10 seconds for this test
  });
});
