import React from 'react'
import { render, screen } from '@testing-library/react'

import Sidebar from '@/src/components/Sidebar'
import { useRouter } from 'next/router'

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))
const mockPush = jest.fn()

describe('Sidebar Component', () => {
  const setIsSidebarOpen = jest.fn()
  const messageSubjectList = ['Test Subject']

  beforeEach(() => {
    // Reset the state of all mocks to their initial state
    jest.resetAllMocks()

    const mockedUseRouter = useRouter as jest.Mock

    // Set the mock to return a specified value telling the mock that whenever useRouter() is called
    // it should return an object with a push method (mockPush)
    mockedUseRouter.mockReturnValue({ push: mockPush })
    render(
      <Sidebar
        setIsSidebarOpen={setIsSidebarOpen}
        messageSubjectList={messageSubjectList}
      />,
    )
  })

  test('renders Sidebar component with all expected elements', () => {
    expect(screen.getByText('Embed RAG File')).toBeInTheDocument()
    expect(screen.getByText('Finetune AI Model')).toBeInTheDocument()
    expect(screen.getByText('Chat With AI')).toBeInTheDocument()
  })

  test('initially renders child menu items correctly based on defaultOpen state', () => {
    expect(screen.queryByText('File 1')).toBeNull()
    expect(screen.queryByText('My Model1')).toBeNull()
    expect(screen.getByText('Test Subject')).toBeInTheDocument() // Visible because defaultOpen is true
  })

  test('Each menuItem has the correct href', () => {
    const manageMyAILink = screen.getByText('Embed RAG File').closest('a')
    expect(manageMyAILink).toHaveAttribute('href', '/embedragfile')

    const finetuneModelLink = screen.getByText('Finetune AI Model').closest('a')
    expect(finetuneModelLink).toHaveAttribute('href', '/finetunemodel')

    const chatWithAILink = screen.getByText('Chat With AI').closest('a')
    expect(chatWithAILink).toHaveAttribute('href', '/')
  })

  test('Sidebar component matches snapshot', () => {
    const { asFragment } = render(
      <Sidebar
        setIsSidebarOpen={setIsSidebarOpen}
        messageSubjectList={messageSubjectList}
      />,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
