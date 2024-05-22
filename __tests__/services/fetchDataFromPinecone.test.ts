import { fetchDataFromPinecone } from '@/src/services/fetchDataFromPinecone'
import { pineconeClient } from '@/src/services/pineconeClient'

jest.mock('@/src/services/pineconeClient', () => {
  return {
    pineconeClient: {
      Index: jest.fn().mockReturnValue( {
        query: jest.fn(),
      }),
    },
  }
})

describe('fetchDataFromPinecone', () => {
  const embeddedQuery = [0.1, 0.2, 0.3]
  const nameSpace = 'test-namespace'

  beforeEach(() => {
    jest.clearAllMocks()
  });

  it('should fetch data successfully', async () => {
    const mockResponse = {
      matches: [
        {
          metadata: {
            text: 'Test text'
          }
        }
      ]
    }
    pineconeClient.Index().query.mockResolvedValue(mockResponse)

    const result = await fetchDataFromPinecone(embeddedQuery, nameSpace)

    expect(pineconeClient.Index).toHaveBeenCalledWith(process.env.PINECONE_INDEX_NAME)
    expect(pineconeClient.Index().query).toHaveBeenCalledWith({
      queryRequest: {
      vector: embeddedQuery,
      topK: 1,
      includeValues: true,
      includeMetadata: true,
      namespace: nameSpace
    }})
    expect(result).toBe('\nTest text')
  })

  it('should throw an error if embeddedQuery is not an array', async () => {
    const embeddedQuery = 'not-an-array'; // Not an array
    const nameSpace = 'test-namespace';
    await expect(fetchDataFromPinecone(embeddedQuery as any, nameSpace))
      .rejects
      .toThrow('Invalid or empty query vector provided.');
  });

  it('should return an error when no matches are found', async () => {
    const mockResponse = { matches: [] }
    pineconeClient.Index().query.mockResolvedValue(mockResponse)

    await expect(fetchDataFromPinecone(embeddedQuery, nameSpace)).rejects.toThrow(
      'No matches found'
    )
  })

  it('should handle errors correctly', async () => {
    pineconeClient.Index().query.mockRejectedValue(new Error('Network Error'))

    await expect(fetchDataFromPinecone(embeddedQuery, nameSpace)).rejects.toThrow(
      'Failed to fetch data from Pinecone'
    )
  })

  it('should throw an error when unable to fetch Pinecone index', async () => {
    // Mock the Index function to return null, simulating the inability to fetch the index
    pineconeClient.Index = jest.fn().mockReturnValue(null);
  
    const embeddedQuery = [0.1, 0.2, 0.3];
    const nameSpace = 'test-namespace';
  
    // The fetchDataFromPinecone function is expected to throw an error because the index could not be fetched
    await expect(fetchDataFromPinecone(embeddedQuery, nameSpace))
      .rejects
      .toThrow('Unable to fetch Pinecone index');
  });
})
