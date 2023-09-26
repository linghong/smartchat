import { renderHook, act } from '@testing-library/react-hooks'
import useInputChange from '@/src/hooks/useInputChange'

describe('useInputChange Hook', () => {
  const initialInput = { testInput: '' }
  const initialInputErrors = { testInput: null }
  const validateInput = jest.fn()

  afterEach(() => {
    validateInput.mockClear()
  })

  it('should initialize with the correct initial values', () => {
    const { result } = renderHook(() => useInputChange({ initialInput, initialInputErrors, validateInput }))
    
    expect(result.current.selectedInput).toEqual(initialInput)
    expect(result.current.inputErrors).toEqual(initialInputErrors)
  })

  it('should handle input change correctly with string value', () => {
    const { result } = renderHook(() => useInputChange({ initialInput, initialInputErrors, validateInput }))
    
    act(() => {
      result.current.handleInputChange({ target: { name: 'testInput', value: 'test' } } as React.ChangeEvent<HTMLInputElement>)
    })
    
    expect(result.current.selectedInput).toEqual({ testInput: 'test' })
    expect(result.current.inputErrors).toEqual({ testInput: null })
    expect(validateInput).toHaveBeenCalledWith('testInput', 'test')
  })

  it('should handle input change correctly with number value', () => {
    const { result } = renderHook(() => useInputChange({ initialInput, initialInputErrors, validateInput }))
    
    act(() => {
      result.current.handleInputChange({ target: { name: 'testInput', value: '123' } } as React.ChangeEvent<HTMLInputElement>)
    })
    
    expect(result.current.selectedInput).toEqual({ testInput: 123 })
    expect(result.current.inputErrors).toEqual({ testInput: null })
    expect(validateInput).toHaveBeenCalledWith('testInput', 123)
  })

  it('should handle input blur correctly', () => {
    const { result } = renderHook(() => useInputChange({ initialInput, initialInputErrors, validateInput }))
    
    act(() => {
      result.current.handleInputBlur({ target: { name: 'testInput', value: 'test' } } as React.ChangeEvent<HTMLInputElement>)
    })
    
    expect(validateInput).toHaveBeenCalledWith('testInput', 'test')
  })
})