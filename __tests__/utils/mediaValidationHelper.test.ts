import { isSupportedImage } from '@/src/utils/mediaValidationHelper';
import { ImageFile } from '@/src/types/chat';

describe('isSupportedImage', () => {
  const createImageFile = (
    size: number,
    mimeType: string,
    name: string = 'test.jpg'
  ): ImageFile => ({
    size,
    mimeType,
    name,
    base64Image:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACklEQVR42mP8/wcAAgUBAXkGKD8AAAAASUVORK5CYII=' // Example base64 string
  });

  it('should validate image for gpt-4-turbo with valid size and type', () => {
    const image = createImageFile(10 * 1024 * 1024, 'image/jpeg');
    const errors = isSupportedImage('gpt-4-turbo', image);
    expect(errors).toEqual([]);
  });

  it('should invalidate image for gpt-4-turbo with invalid size', () => {
    const image = createImageFile(21 * 1024 * 1024, 'image/jpeg');
    const errors = isSupportedImage('gpt-4-turbo', image);
    expect(errors).toContain(
      'the size of Image test.jpg must be less than 20MB.'
    );
  });

  it('should invalidate image for gpt-4-turbo with invalid type', () => {
    const image = createImageFile(10 * 1024 * 1024, 'image/bmp');
    const errors = isSupportedImage('gpt-4-turbo', image);
    expect(errors).toContain(
      'Only .png, .jpeg, .jpg, .webp, and non-animated .gif. images are supported by OpenAI.'
    );
  });

  it('should validate image for gemini-1.5-pro with valid size and type', () => {
    const image = createImageFile(10 * 1024 * 1024, 'image/png');
    const errors = isSupportedImage('gemini-1.5-pro', image);
    expect(errors).toEqual([]);
  });

  it('should invalidate image for gemini-1.5-pro with invalid type', () => {
    const image = createImageFile(10 * 1024 * 1024, 'image/tiff');
    const errors = isSupportedImage('gemini-1.5-pro', image);
    expect(errors).toContain(
      'Only .png, .jpeg, .webp,.heic and .heif images are supported by Gemini.'
    );
  });

  it('should validate image for claude-3-5-sonnet-20240620 with valid size and type', () => {
    const image = createImageFile(4 * 1024 * 1024, 'image/webp');
    const errors = isSupportedImage('claude-3-5-sonnet-20240620', image);
    expect(errors).toEqual([]);
  });

  it('should invalidate image for claude-3-5-sonnet-20240620 with invalid size', () => {
    const image = createImageFile(6 * 1024 * 1024, 'image/webp');
    const errors = isSupportedImage('claude-3-5-sonnet-20240620', image);
    expect(errors).toContain(
      'The size of Image test.jpg must be less tan 5MB.'
    );
  });

  it('should invalidate image for an unsupported model', () => {
    const image = createImageFile(1 * 1024 * 1024, 'image/jpeg');
    const errors = isSupportedImage('unsupported-model', image);
    expect(errors).toContain('Unsupported model or invalid parameters');
  });
});
