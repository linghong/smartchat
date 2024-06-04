import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ImageUploadIcon from '@/src/components/ImageUploadIcon'

describe('ImageUploadIcon', () => {
  const onImageUpload = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  });

  it('should render the upload icon', () => {
    render(<ImageUploadIcon onImageUpload={onImageUpload} />)

    const icon = screen.getByLabelText('Upload image')
    expect(icon).toBeInTheDocument()
  });

  it('should trigger file input click when icon is clicked', () => {
    render(<ImageUploadIcon onImageUpload={onImageUpload} />)

    const icon = screen.getByLabelText('Upload image')
    fireEvent.click(icon)

    const fileInput = screen.getByLabelText('Upload image')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveProperty('type', 'file')
  })

  it('should trigger file input click when Enter key is pressed', () => {
    render(<ImageUploadIcon onImageUpload={onImageUpload} />)

    const icon = screen.getByLabelText('Upload image')
    fireEvent.keyDown(icon, { key: 'Enter', code: 'Enter' })

    const fileInput = screen.getByLabelText('Upload image')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveProperty('type', 'file')
  });

  it('should call onImageUpload when a file is selected', () => {
    render(<ImageUploadIcon onImageUpload={onImageUpload} />)

    const fileInput = screen.getByLabelText('Upload image') as HTMLInputElement
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(onImageUpload).toHaveBeenCalledTimes(1)
    expect(onImageUpload).toHaveBeenCalledWith(file)
  })

  it('should match snapshot', () => {
    const { asFragment } = render(<ImageUploadIcon onImageUpload={onImageUpload} />)
    
    expect(asFragment()).toMatchSnapshot()
  })
})

