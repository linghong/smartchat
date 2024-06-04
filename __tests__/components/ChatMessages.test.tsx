import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatMessage from '@/src/components/ChatMessage'
import { Message } from '@/src/types/chat'

describe('ChatMessage Component', () => {
  let message : Message
  let loading : boolean
  let lastIndex : boolean
  let imageSrc: string[]
  let handleImageDelete: jest.Mock

  beforeEach(() => {
    message = { question: 'What is AI?', answer: 'AI stands for Artificial Intelligence.' }
    loading = false
    lastIndex = true
    handleImageDelete = jest.fn()
    imageSrc = ['/path/to/image1.png', 'path/to/image2.png']
    render(<ChatMessage 
      message={message} 
      lastIndex={lastIndex} 
      loading={loading} 
      imageSrc={imageSrc}
      handleImageDelete={handleImageDelete}
      />)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders ChatMessage component correctly with question and answer', () => {
    expect(screen.getByText('What is AI?')).toBeInTheDocument()
    expect(screen.getByText('AI stands for Artificial Intelligence.')).toBeInTheDocument()
  })

  it('applies animate-pulse class when loading and is the last index', () => {
    act (() => {
      render(<ChatMessage 
        message={message} 
        lastIndex={true} 
        loading={true}
        imageSrc={imageSrc}
        handleImageDelete={handleImageDelete}
      />)
    })
    const botImages = screen.getAllByAltText('AI bot avatar') as HTMLElement[]
    expect(botImages[botImages.length - 1]).toHaveClass('animate-pulse')
  })

  it('does not apply animate-pulse class when not loading', () => {
    act (() => {
      render(<ChatMessage 
        message={message} 
        lastIndex={true} 
        loading={false}
        imageSrc={imageSrc}
        handleImageDelete={handleImageDelete}
      />)
    })
   
    const botImages = screen.getAllByAltText('AI bot avatar') as HTMLElement[]
    expect(botImages[botImages.length - 1]).not.toHaveClass('animate-pulse')
  })
  
  it('ChatMessage component snapshot', () => {
    const { asFragment } =  render(<ChatMessage 
      message={message} 
      lastIndex={lastIndex} 
      loading={loading}
      imageSrc={imageSrc}
      handleImageDelete={handleImageDelete}
    />)
    expect(asFragment()).toMatchSnapshot()
  })
})