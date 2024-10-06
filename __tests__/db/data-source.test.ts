import { DataSource } from 'typeorm';
import AppDataSourceSingleton from '@/src/db/data-source';
import { User, Chat, ChatMessage, ChatFile, AIConfig } from '@/src/db/entities';

// Mock TypeORM's DataSource
jest.mock('typeorm', () => {
  const actualTypeorm = jest.requireActual('typeorm');
  return {
    ...actualTypeorm,
    DataSource: jest.fn().mockImplementation(() => ({
      isInitialized: false,
      initialize: jest.fn().mockResolvedValue(true)
    }))
  };
});

describe('AppDataSourceSingleton', () => {
  // ... (previous test cases remain the same)

  it('should throw an error if initialization fails', async () => {
    const mockError = new Error('Initialization failed');
    const mockDataSource = {
      isInitialized: false,
      initialize: jest.fn().mockRejectedValue(mockError)
    };
    (DataSource as jest.MockedClass<typeof DataSource>).mockImplementation(
      () => mockDataSource as any
    );

    // Spy on console.error and suppress its output
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(AppDataSourceSingleton.getInstance()).rejects.toThrow(
      'Initialization failed'
    );

    // Verify that console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during data source initialization',
      mockError
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
