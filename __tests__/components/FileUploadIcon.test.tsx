import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import FileUploadIcon from '@/src/components/FileUploadIcon';

describe('FileUploadIcon', () => {
  const onFileUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the upload icon', () => {
    render(<FileUploadIcon onFileUpload={onFileUpload} isDisabled={false} />);

    const icon = screen.getByLabelText('Upload file');
    expect(icon).toBeInTheDocument();
  });

  it('should trigger file input click when icon is clicked', () => {
    render(<FileUploadIcon onFileUpload={onFileUpload} isDisabled={false} />);

    const icon = screen.getByLabelText('Upload file');
    fireEvent.click(icon);

    const fileInput = screen.getByLabelText('Upload file');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveProperty('type', 'file');
  });

  it('should trigger file input click when Enter key is pressed', () => {
    render(<FileUploadIcon onFileUpload={onFileUpload} isDisabled={false} />);

    const icon = screen.getByLabelText('Upload file');
    fireEvent.keyDown(icon, { key: 'Enter', code: 'Enter' });

    const fileInput = screen.getByLabelText('Upload file');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveProperty('type', 'file');
  });

  it('should call onFileUpload when a file is selected and not disabled', () => {
    render(<FileUploadIcon onFileUpload={onFileUpload} isDisabled={false} />);

    const fileInput = screen.getByLabelText('Upload file') as HTMLInputElement;
    const file = new File(['dummy content'], 'example.txt', {
      type: 'text/plain'
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileUpload).toHaveBeenCalledTimes(1);
    expect(onFileUpload).toHaveBeenCalledWith(file);
  });

  it('should not allow file upload when disabled', () => {
    render(<FileUploadIcon onFileUpload={onFileUpload} isDisabled={true} />);

    const fileInput = screen.getByLabelText('Upload file') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('type', 'none');

    const file = new File(['dummy content'], 'example.txt', {
      type: 'text/plain'
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileUpload).not.toHaveBeenCalled();
  });

  it('should accept various file types', () => {
    render(<FileUploadIcon onFileUpload={onFileUpload} isDisabled={false} />);

    const fileInput = screen.getByLabelText('Upload file') as HTMLInputElement;
    expect(fileInput).toHaveAttribute(
      'accept',
      expect.stringContaining('image/*, .pdf, .html, .xml, .docx, .txt')
    );
  });

  it('should allow custom accept attribute', () => {
    const customAccept = '.csv, .xlsx';
    render(
      <FileUploadIcon
        onFileUpload={onFileUpload}
        isDisabled={false}
        accept={customAccept}
      />
    );

    const fileInput = screen.getByLabelText('Upload file') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('accept', customAccept);
  });

  it('should match snapshot when enabled', () => {
    const { asFragment } = render(
      <FileUploadIcon onFileUpload={onFileUpload} isDisabled={false} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should match snapshot when disabled', () => {
    const { asFragment } = render(
      <FileUploadIcon onFileUpload={onFileUpload} isDisabled={true} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
