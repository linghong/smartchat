import { fetchDataFromPinecone } from '@/src/services/fetchDataFromPinecone'
import { pineconeClient } from '@/src/services/pineconeClient'

jest.mock('@/src/services/pineconeClient', () => {
  return {
    pineconeClient: {
      Index: jest.fn().mockReturnValue({
        namespace: jest.fn().mockReturnValue({
          query: jest.fn(),
        }),
      }),
    },
  }
})

describe('fetchDataFromPinecone', () => {
  const embeddedQuery = [0.1, 0.2, 0.3]
  const nameSpace = 'test-namespace'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data successfully', async () => {
    const mockIndex = pineconeClient.Index as jest.Mock
    const mockNamespace = mockIndex().namespace as jest.Mock
    const mockQuery = mockNamespace().query as jest.Mock

    mockQuery.mockResolvedValue({
      matches: [
        {
          metadata: {
            text: 'Test text',
          },
        },
      ],
    })

    const result = await fetchDataFromPinecone(embeddedQuery, nameSpace)

    expect(mockIndex).toHaveBeenCalledWith(process.env.PINECONE_INDEX_NAME)
    expect(mockNamespace).toHaveBeenCalledWith(nameSpace)
    expect(mockQuery).toHaveBeenCalledWith({
      vector: embeddedQuery,
      topK: 3,
      includeValues: true,
      includeMetadata: true,
    })
    expect(result).toBe('\nTest text')
  })

  it('should throw an error if embeddedQuery is not an array', async () => {
    const embeddedQuery = 'not-an-array' // Not an array

    await expect(
      fetchDataFromPinecone(embeddedQuery as any, nameSpace),
    ).rejects.toThrow('Invalid or empty query vector provided.')
  })

  it('should return an error when no matches are found', async () => {
    const mockIndex = pineconeClient.Index as jest.Mock
    const mockNamespace = mockIndex().namespace as jest.Mock
    const mockQuery = mockNamespace().query as jest.Mock

    mockQuery.mockResolvedValue({ matches: [] })

    await expect(
      fetchDataFromPinecone(embeddedQuery, nameSpace),
    ).rejects.toThrow('No matches found')
  })

  it('should handle errors correctly', async () => {
    const mockIndex = pineconeClient.Index as jest.Mock
    const mockNamespace = mockIndex().namespace as jest.Mock
    const mockQuery = mockNamespace().query as jest.Mock

    mockQuery.mockRejectedValue(new Error('Network Error'))

    await expect(
      fetchDataFromPinecone(embeddedQuery, nameSpace),
    ).rejects.toThrow('Failed to fetch data from Pinecone')
  })

  it('should throw an error when unable to fetch Pinecone index', async () => {
    // Mock the Index function to return null, simulating the inability to fetch the index
    const mockIndex = pineconeClient.Index as jest.Mock

    mockIndex.mockReturnValue(null)

    // The fetchDataFromPinecone function is expected to throw an error because the index could not be fetched
    await expect(
      fetchDataFromPinecone(embeddedQuery, nameSpace),
    ).rejects.toThrow('Unable to fetch Pinecone index')
  })
})
