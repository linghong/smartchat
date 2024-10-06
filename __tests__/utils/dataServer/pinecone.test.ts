import { fetchNamespaces } from '@/src/utils/dataServer/pinecone';
import { getNamespaces } from '@/src/services/rag/pineconeClient';
import * as env from '@/config/env';

jest.mock('@/src/services/rag/pineconeClient', () => ({
  getNamespaces: jest.fn()
}));

jest.mock('@/config/env', () => ({
  PINECONE_INDEX_NAME: 'fake-pinecone-index'
}));

describe('fetchNamespaces', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return namespaces when successful', async () => {
    const mockNamespaces = ['namespace1', 'namespace2'];
    (getNamespaces as jest.Mock).mockResolvedValue(mockNamespaces);

    const result = await fetchNamespaces();

    expect(getNamespaces).toHaveBeenCalledWith('fake-pinecone-index');
    expect(result).toEqual(mockNamespaces);
  });

  it('should return an empty array when PINECONE_INDEX_NAME is not defined', async () => {
    // remove module caching and refetchNamespaces, otherwise fetchNamespaces would still use previous PINECONE_INDEX_NAME
    jest.resetModules();
    jest.mock('@/config/env', () => ({
      PINECONE_INDEX_NAME: undefined
    }));
    const { fetchNamespaces } = require('@/src/utils/dataServer/pinecone');

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const result = await fetchNamespaces();

    expect(getNamespaces).not.toHaveBeenCalled();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Missing Pinecone index name');

    consoleSpy.mockRestore();
  });

  it('should return an empty array and log error when getNamespaces throws', async () => {
    const mockError = new Error('Test error');
    (getNamespaces as jest.Mock).mockRejectedValue(mockError);
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const result = await fetchNamespaces();

    expect(getNamespaces).toHaveBeenCalledWith('fake-pinecone-index');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching namespaces:',
      mockError
    );
    expect(result).toEqual([]);

    consoleSpy.mockRestore();
  });
});
