import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import UploadFile from '@/src/components/UploadFile'

// Mock component props
const label = "Upload Training Data: "
const fileType = ".pdf"
const uploadError = null

const setup = () => {
  const setUploadError = jest.fn()
  const setSelectedFile = jest.fn()

  render(<UploadFile label={label} fileType={fileType} uploadError={uploadError} setUploadError={setUploadError} setSelectedFile={setSelectedFile} />)
  
  const input = screen.getByTestId('fileInput') as HTMLInputElement;
  return {
    input,
    setUploadError,
    setSelectedFile,
  }
}

describe('UploadFile Component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  });

  it('renders UploadFile component', () => {
    const { input } = setup()
    expect(input).toBeInTheDocument()
  })

  test('handles file change event', async() => {
    const { input, setSelectedFile, setUploadError } = setup()
    const file = new File(['dummy content'], 'example.pdf', { type: 'application/pdf' })
    await userEvent.upload(input, file)

    expect(setSelectedFile).toHaveBeenCalledWith(file)
  })

  /*test('handles file size error', () => {
    const { input, setUploadError } = setup();
    const dummyStr = 'dummy content'
    const repetitions = Math.ceil((1000 *1024*1024) / dummyStr.length)

    const largeFile = new File(['dummy content'.repeat(repetitions)], 'largeFile.pdf', { type: 'application/pdf' })
    userEvent.upload(input, largeFile)

    expect(setUploadError).toHaveBeenCalledWith("Maximum file size to upload is 200MB.")
  })*/
  
  test('UploadFile component snapshot', () => {
    const { asFragment } = render(<UploadFile label={label} fileType={fileType} uploadError={uploadError} setUploadError={jest.fn} setSelectedFile={jest.fn} />)

    expect(asFragment()).toMatchSnapshot()
  })
})