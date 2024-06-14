import { renderHook, act } from '@testing-library/react-hooks'
import { useFormSubmission } from '@/src/hooks'
import {
  enableFetchMocks,
  resetMocks,
  mockResponseOnce,
  mockRejectOnce,
} from 'jest-fetch-mock'

// Enable fetch mocks
enableFetchMocks()

describe('useFormSubmission Hook', () => {
  let url: string, formData: FormData

  beforeEach(() => {
    resetMocks()
    url = 'http://example.com/submit'
    formData = new FormData()
    formData.append('key', 'value')
    jest.spyOn(console, 'log').mockImplementation(() => {}) // Mock console.log
  })

  afterEach(() => {
    jest.restoreAllMocks() // Restore console.log after each test
  })

  it('should handle a successful form submission', async () => {
    const successResponse = { success: true, id: '12345', error: null }
    mockResponseOnce(JSON.stringify(successResponse))

    const { result, waitForNextUpdate } = renderHook(() => useFormSubmission())

    act(() => {
      result.current.handleFormSubmit(url, formData)
    })

    // Expect isLoading to be true after form submission is initiated
    expect(result.current.isLoading).toBeTruthy()
    await waitForNextUpdate()

    // Expect isLoading to be false and successMessage to be set after successful form submission
    expect(result.current.isLoading).toBeFalsy()
    expect(result.current.successMessage).toBe(successResponse.id)
    expect(result.current.error).toBeNull()
  })

  it('should handle an unsuccessful form submission', async () => {
    const errorResponse = {
      success: false,
      id: null,
      error: 'Form submission failed',
    }
    mockResponseOnce(JSON.stringify(errorResponse))

    const { result, waitForNextUpdate } = renderHook(() => useFormSubmission())

    act(() => {
      result.current.handleFormSubmit(url, formData)
    })

    await waitForNextUpdate()

    // Expect isLoading to be false and error to be set after unsuccessful form submission
    expect(result.current.isLoading).toBeFalsy()
    expect(result.current.successMessage).toBeNull()
    expect(result.current.error).toBe(errorResponse.error)
  })

  it('should handle a network error', async () => {
    mockRejectOnce(new Error('Network Error'))

    const { result, waitForNextUpdate } = renderHook(() => useFormSubmission())

    act(() => {
      result.current.handleFormSubmit(url, formData)
    })

    await waitForNextUpdate()

    // Expect isLoading to be false and error to be set after a network error
    expect(result.current.isLoading).toBeFalsy()
    expect(result.current.successMessage).toBeNull()
    expect(result.current.error).toBe(
      'There was a network error when sending file.',
    )
  })
})
