import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ImageListWithModal from '@/src/components/ImageListWithModal'

describe('ImageListWithModal', () => {
  const imageSrc = ["http://example.com/image1.jpg", "http://example.com/image2.jpg"]
  const handleImageDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the list of images', () => {
    render(<ImageListWithModal imageSrc={imageSrc} handleImageDelete={handleImageDelete} />)

    const images = screen.getAllByRole('button', { name: /click to view larger image/i })
    expect(images).toHaveLength(imageSrc.length)
  })

  it('should open the modal when an image is clicked', () => {
    render(<ImageListWithModal imageSrc={imageSrc} handleImageDelete={handleImageDelete} />)

    const image = screen.getByRole('button', { name: /click to view larger image 1/i })
    fireEvent.click(image)

    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()

    const modalImage = screen.getByAltText('Expanded view')
    expect(modalImage).toBeInTheDocument()
    expect(modalImage).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(imageSrc[0])))
  })

  it('should open the modal when Enter key is pressed', () => {
    render(<ImageListWithModal imageSrc={imageSrc} handleImageDelete={handleImageDelete} />)

    const image = screen.getByRole('button', { name: /click to view larger image 1/i })
    fireEvent.keyDown(image, { key: 'Enter', code: 'Enter' })

    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()

    const modalImage = screen.getByAltText('Expanded view')
    expect(modalImage).toBeInTheDocument()
    expect(modalImage).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(imageSrc[0])))
  })

  it('should close the modal when the close button is clicked', () => {
    render(<ImageListWithModal imageSrc={imageSrc} handleImageDelete={handleImageDelete} />)

    const image = screen.getByRole('button', { name: /click to view larger image 1/i })
    fireEvent.click(image)

    const closeButton = screen.getByRole('button', { name: /close image view/i })
    fireEvent.click(closeButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should display the delete icon when isDeleteIconShow is true', () => {
    render(<ImageListWithModal imageSrc={imageSrc} handleImageDelete={handleImageDelete} isDeleteIconShow={true} />)

    const deleteIcons = screen.getAllByLabelText(/delete image/i)
    expect(deleteIcons).toHaveLength(imageSrc.length)
  })

  it('should not display the delete icon when isDeleteIconShow is false', () => {
    render(<ImageListWithModal imageSrc={imageSrc} handleImageDelete={handleImageDelete} isDeleteIconShow={false} />)

    const deleteIcons = screen.queryAllByLabelText(/delete image/i)
    expect(deleteIcons).toHaveLength(0)
  })

  it('should call handleImageDelete when the delete icon is clicked', () => {
    render(<ImageListWithModal imageSrc={imageSrc} handleImageDelete={handleImageDelete} isDeleteIconShow={true} />)

    const deleteIcon = screen.getByLabelText('Delete image 1')
    fireEvent.click(deleteIcon);

    expect(handleImageDelete).toHaveBeenCalledTimes(1)
    expect(handleImageDelete).toHaveBeenCalledWith(0)
  })

  it('should match snapshot', () => {
    const { asFragment } = render(<ImageListWithModal imageSrc={imageSrc} handleImageDelete={handleImageDelete} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
