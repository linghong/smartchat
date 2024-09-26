import { Root } from 'react-dom/client';

const mockCreateRoot = jest.fn(() => ({
  render: jest.fn(),
  unmount: jest.fn()
})) as jest.Mock<Root>;

export const createRoot = mockCreateRoot;
