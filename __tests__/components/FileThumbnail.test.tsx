import React from 'react';
import { render, screen } from '@testing-library/react';
import FileThumbnail from '@/src/components/FileThumbnail';
import { FileData } from '@/src/types/chat';

// Mock the FileData type
const mockFileData: FileData = {
  name: 'test-file.txt',
  size: 1024,
  type: 'text/plain',
  lastModified: new Date('2023-01-01').getTime()
};

describe('FileThumbnail', () => {
  it('renders the file name', () => {
    render(<FileThumbnail fileData={mockFileData} />);
    const fileNameText = screen.getByText('test-file.txt', { selector: 'div' });
    expect(fileNameText).toBeInTheDocument();
  });

  it('renders the "File" text in the SVG', () => {
    render(<FileThumbnail fileData={mockFileData} />);
    expect(screen.getByText('File')).toBeInTheDocument();
  });

  it('truncates long file names in the SVG text', () => {
    const longNameFileData: FileData = {
      ...mockFileData,
      name: 'very-long-file-name-that-should-be-truncated.txt'
    };
    render(<FileThumbnail fileData={longNameFileData} />);
    const truncatedText = screen.getByText('very-long-file-na...');
    expect(truncatedText).toBeInTheDocument();
    expect(truncatedText).toHaveClass('opacity-0', 'group-hover:opacity-100');
  });

  it('does not truncate short file names in the SVG text', () => {
    render(<FileThumbnail fileData={mockFileData} />);
    const fileNameText = screen.getByText('test-file.txt', {
      selector: 'text'
    });
    expect(fileNameText).toBeInTheDocument();
    expect(fileNameText).toHaveClass('opacity-0', 'group-hover:opacity-100');
  });

  it('renders the file name in the bottom overlay', () => {
    render(<FileThumbnail fileData={mockFileData} />);
    const overlay = screen.getByText('test-file.txt', { selector: 'div' });
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass(
      'absolute',
      'bottom-0',
      'left-0',
      'right-0',
      'bg-black',
      'bg-opacity-50',
      'text-white',
      'text-xs',
      'p-1',
      'truncate'
    );
  });

  it('applies correct classes to the main container', () => {
    const { container } = render(<FileThumbnail fileData={mockFileData} />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('w-24', 'h-24', 'relative', 'group');
  });

  it('renders an SVG with correct attributes', () => {
    const { container } = render(<FileThumbnail fileData={mockFileData} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
    expect(svg).toHaveClass('w-full', 'h-full');
  });

  it('applies correct styles to SVG paths', () => {
    const { container } = render(<FileThumbnail fileData={mockFileData} />);
    const paths = container.querySelectorAll('path');
    expect(paths[0]).toHaveAttribute('d', 'M20 10 H70 L80 20 V90 H20 Z');
    expect(paths[1]).toHaveAttribute('d', 'M70 10 V20 H80');
    expect(paths[1]).toHaveClass('fill-none');
  });

  it('renders correctly', () => {
    const { container } = render(<FileThumbnail fileData={mockFileData} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
