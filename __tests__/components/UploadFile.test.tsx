import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import UploadFile from '@/src/components/UploadFile';

// Mock component props
const label = 'Upload Training Data: ';
const fileType = '.pdf';
const name = 'uploadFile';
const uploadErrors = { file: null };

const setup = () => {
  const setUploadErrors = jest.fn();
  const setSelectedUpload = jest.fn();

  render(
    <UploadFile
      label={label}
      fileType={fileType}
      name={name}
      uploadErrors={uploadErrors}
      setUploadErrors={setUploadErrors}
      setSelectedUpload={setSelectedUpload}
    />
  );

  const input = screen.getByTestId('fileInput') as HTMLInputElement;
  return {
    input,
    setUploadErrors,
    setSelectedUpload
  };
};

describe('UploadFile Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders UploadFile component', () => {
    const { input } = setup();
    expect(input).toBeInTheDocument();
  });

  test('handles file change event', async () => {
    const { input, setSelectedUpload, setUploadErrors } = setup();
    const file = new File(['dummy content'], 'example.pdf', {
      type: 'application/pdf'
    });
    await userEvent.upload(input, file);

    expect(setSelectedUpload).toHaveBeenCalledWith(expect.any(Function));

    // Grab the callback function and test it
    const callback = setSelectedUpload.mock.calls[0][0]; // get the first argument of the first call
    const dummyPrevState = {};
    const newState = callback(dummyPrevState);
    expect(newState[name]).toBe(file);
  });

  /*test('handles file size error', () => {
    const { input, setUploadError } = setup();
    const dummyStr = 'dummy content'
    const repetitions = Math.ceil((1000 *1024*1024) / dummyStr.length)

    const largeFile = new File(['dummy content'.repeat(repetitions)], 'largeFile.pdf', { type: 'application/pdf' })
    userEvent.upload(input, largeFile)

    expect(setUploadError).toHaveBeenCalledWith("Maximum file size to upload is 200MB.")
  })*/

  test('UploadFile component snapshot', () => {
    const { asFragment } = render(
      <UploadFile
        label={label}
        fileType={fileType}
        name={name}
        uploadErrors={uploadErrors}
        setUploadErrors={jest.fn}
        setSelectedUpload={jest.fn}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
