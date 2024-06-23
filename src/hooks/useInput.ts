/*
 * similar as useInputChange, but it uses generic input data type
 */
import { useState, ChangeEvent, Dispatch, SetStateAction } from 'react'
import { InputErrors, Input } from '@/src/types/common'

interface UseInputProps<T> {
  initialInput: Input<T>
  initialInputErrors: InputErrors
  validateInput: (name: string, value: T) => void
}
interface UseInputReturn<T> {
  selectedInput: Input<T>
  inputErrors: InputErrors
  setSelectedInput: Dispatch<SetStateAction<Input<T>>>
  setInputErrors: Dispatch<SetStateAction<InputErrors>>
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleInputBlur: (e: ChangeEvent<HTMLInputElement>) => void
}

const useInput = <T extends string | number>({
  initialInput,
  initialInputErrors,
  validateInput
}: UseInputProps<T>): UseInputReturn<T> => {
  const [selectedInput, setSelectedInput] = useState<Input<T>>(initialInput)
  const [inputErrors, setInputErrors] =
    useState<InputErrors>(initialInputErrors)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const parsedValue: T =
      typeof selectedInput[name] === 'number'
        ? (parseFloat(value) as T)
        : (value as T)

    setSelectedInput(prev => ({ ...prev, [name]: parsedValue }))
    setInputErrors((prev: InputErrors) => ({
      ...prev,
      [name]: value
    }))
    validateInput(name, parsedValue)
  }

  const handleInputBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const parsedValue: T =
      typeof selectedInput[name] === 'number'
        ? (parseFloat(value) as T)
        : (value as T)

    validateInput(name, parsedValue)
  }

  return {
    selectedInput,
    inputErrors,
    setSelectedInput,
    setInputErrors,
    handleInputChange,
    handleInputBlur
  }
}

export default useInput
