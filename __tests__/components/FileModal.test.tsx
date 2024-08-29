import React from 'react';
import {
  render,
  screen,
  fireEvent,
  RenderResult
} from '@testing-library/react';
import '@testing-library/jest-dom';

import FileModal from '@/src/components/FileModal';

describe('FileModal', () => {
  const fileData = {
    base64Content: 'http://localhost:3000/example.png',
    type: 'image/png',
    size: 2 * 1024 * 1024, //2MB
    name: 'example.png'
  };
  const onClose = jest.fn();
  let component: RenderResult;

  beforeEach(() => {
    component = render(<FileModal fileData={fileData} onClose={onClose} />);
  });

  it('should render the modal with the file', () => {
    const file = screen.getByAltText('Expanded view');

    expect(file).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    const closeButton = screen.getByRole('button', {
      name: /close image view/i
    });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should have the correct accessibility attributes', () => {
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modalTitle');
    expect(dialog).toHaveAttribute(
      'aria-describedby',
      'Extended view of the uploaded image'
    );
  });

  it('should match snapshot', () => {
    const { asFragment } = component;
    expect(asFragment()).toMatchSnapshot();
  });
});
