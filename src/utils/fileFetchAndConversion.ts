/**
 * Converts a Blob object to a File object.
 * @param blob - The Blob object to convert.
 * @param fileName - The name of the resulting File.
 * @returns The converted File object.
 */
export const blobToFile = (blob: Blob, fileName: string): File => {
  const file = new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  })
  return file
}

/**
 * Converts a File object to a base64 string.
 * @param file - The File object to convert.
 * @returns A promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Fetches an image from a URL and converts it to a base64 string.
 * @param url - The URL of the image to fetch.
 * @returns A promise that resolves with the base64 string.
 */
export const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}