// __tests__/utils/fetchData.test.ts
import { fetchData } from '@/src/utils/fetchData';
import { enableFetchMocks } from 'jest-fetch-mock';

// Enable fetch mocks
enableFetchMocks();

describe('fetchData', () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    // Resets the state of all fetch mocks provided by the jest-fetch-mock library
    fetch.resetMocks();

    // Mocks console.error to prevent actual error logs during tests and allows verification of error logs
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restores all mocks created by jest.spyOn, jest.mock, and jest.fn to their original implementations
    jest.restoreAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { key: 'value' };
    fetch.mockResponseOnce(JSON.stringify(mockData));

    const data = await fetchData('test-endpoint');

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/test-endpoint`);
    expect(data).toEqual(mockData);
  });

  it('should handle fetch error', async () => {
    fetch.mockRejectOnce(new Error('Network Error'));

    const data = await fetchData('test-endpoint');

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/test-endpoint`);
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching test-endpoint:',
      expect.any(Error)
    );
    expect(data).toEqual({
      props: {
        error: 'Failed to fetch data.'
      }
    });
  });

  it('should handle non-OK response1', async () => {
    fetch.mockResponseOnce('', {
      status: 500,
      statusText: 'Internal Server Error'
    });

    const data = await fetchData('test-endpoint');

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/test-endpoint`);
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching test-endpoint:',
      new Error('Error fetching test-endpoint: Internal Server Error')
    );
    expect(data).toEqual({
      props: {
        error: 'Failed to fetch data.'
      }
    });
  });
});
