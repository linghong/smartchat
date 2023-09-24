import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatMessage from '@/src/components/ChatMessage'
import { Message } from '@/src/types/chat'

describe('ChatMessage Component', () => {
  let message : Message
  let loading : boolean
  let lastIndex : boolean

  beforeEach(() => {
    message = { question: 'What is AI?', answer: 'AI stands for Artificial Intelligence.' }
    loading = false
    lastIndex = true
    render(<ChatMessage message={message} lastIndex={lastIndex} loading={loading} />)
  })

  afterEach(() => {
    jest.clearAllMocks()
  });
  it('renders ChatMessage component correctly with question and answer', () => {
    expect(screen.getByText('What is AI?')).toBeInTheDocument()
    expect(screen.getByText('AI stands for Artificial Intelligence.')).toBeInTheDocument()
  })

  it('applies animate-pulse class when loading and is the last index', async () => {
    await act (() => {
      render(<ChatMessage message={message} lastIndex={true} loading={true} />)
    })
    const botImages = screen.getAllByAltText('AI Bot') as HTMLElement[]
    expect(botImages[botImages.length - 1]).toHaveClass('animate-pulse')
  })

  it('does not apply animate-pulse class when not loading', async () => {
    await act (() => {
      render(<ChatMessage message={message} lastIndex={true} loading={false} />)
    })
   
    const botImages = await screen.getAllByAltText('AI Bot') as HTMLElement[]
    expect(botImages[botImages.length - 1]).not.toHaveClass('animate-pulse')
  })
  
  it('ChatMessage component snapshot', () => {
    const { asFragment } =  render(<ChatMessage message={message} lastIndex={lastIndex} loading={loading} />)
    expect(asFragment()).toMatchSnapshot()
  })
})