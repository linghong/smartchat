import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import FileListWithModal from '@/src/components/FileListWithModal';

describe('FileListWithModal', () => {
  const fileSrc = [
    {
      base64Content: 'data:image/png;base64,base64Imagedata1',
      type: 'image/png',
      size: 5000,
      name: 'image1'
    },
    {
      base64Content: 'data:image/png;base64,base64Imagedata2',
      type: 'image/png',
      size: 8000,
      name: 'image2'
    }
  ];

  const handleFileDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the list of images', () => {
    render(
      <FileListWithModal
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );

    const files = screen.getAllByRole('button', {
      name: /click to view larger file/i
    });
    expect(files).toHaveLength(fileSrc.length);
  });

  it('should open the modal when an image is clicked', () => {
    render(
      <FileListWithModal
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );

    const image = screen.getByRole('button', {
      name: /click to view larger file 1/i
    });
    fireEvent.click(image);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    const modalImage = screen.getByAltText('Expanded view');
    expect(modalImage).toBeInTheDocument();
    expect(modalImage).toHaveAttribute('src', fileSrc[0].base64Image);
  });

  it('should open the modal when Enter key is pressed', () => {
    render(
      <FileListWithModal
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );

    const image = screen.getByRole('button', {
      name: /click to view larger file 1/i
    });
    fireEvent.keyDown(image, { key: 'Enter', code: 'Enter' });

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    const modalImage = screen.getByAltText('Expanded view');
    expect(modalImage).toBeInTheDocument();
    expect(modalImage).toHaveAttribute('src', fileSrc[0].base64Image);
  });

  it('should close the modal when the close button is clicked', () => {
    render(
      <FileListWithModal
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );

    const image = screen.getByRole('button', {
      name: /click to view larger file 1/i
    });
    fireEvent.click(image);

    const closeButton = screen.getByRole('button', {
      name: /close image view/i
    });
    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display the delete icon when isDeleteIconShow is true', () => {
    render(
      <FileListWithModal
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
        isDeleteIconShow={true}
      />
    );

    const deleteIcons = screen.getAllByLabelText(/Delete file/i);
    expect(deleteIcons).toHaveLength(fileSrc.length);
  });

  it('should not display the delete icon when isDeleteIconShow is false', () => {
    render(
      <FileListWithModal
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
        isDeleteIconShow={false}
      />
    );

    const deleteIcons = screen.queryAllByLabelText(/Delete file/i);
    expect(deleteIcons).toHaveLength(0);
  });

  it('should call handleFileDelete when the delete icon is clicked', () => {
    render(
      <FileListWithModal
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
        isDeleteIconShow={true}
      />
    );

    const deleteIcon = screen.getByLabelText('Delete file 1');
    fireEvent.click(deleteIcon);

    expect(handleFileDelete).toHaveBeenCalledTimes(1);
    expect(handleFileDelete).toHaveBeenCalledWith(0);
  });

  it('should match snapshot', () => {
    const { asFragment } = render(
      <FileListWithModal
        fileSrc={fileSrc}
        handleFileDelete={handleFileDelete}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
