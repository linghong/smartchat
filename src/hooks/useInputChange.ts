/*
 * similar as useInput, but it uses mixed input data type of number | string
 */
import { useState, ChangeEvent, Dispatch, SetStateAction } from 'react'
import { InputErrors, InputData } from '@/src/types/common'

interface UseInputProps {
  initialInput: InputData
  initialInputErrors: InputErrors
  validateInput: (name: string, value: string | number) => void
}

interface UseInputReturn {
  selectedInput: InputData
  inputErrors: InputErrors
  setSelectedInput: Dispatch<SetStateAction<InputData>>
  setInputErrors: Dispatch<SetStateAction<InputErrors>>
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleInputBlur: (e: ChangeEvent<HTMLInputElement>) => void
}

const useInputChange = ({
  initialInput,
  initialInputErrors,
  validateInput,
}: UseInputProps): UseInputReturn => {
  const [selectedInput, setSelectedInput] = useState<InputData>(initialInput)
  const [inputErrors, setInputErrors] =
    useState<InputErrors>(initialInputErrors)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const isNumber = !isNaN(Number(value))
    const parsedValue = isNumber ? parseFloat(value) : value

    setSelectedInput(prev => ({ ...prev, [name]: parsedValue }))
    setInputErrors((prev: InputErrors) => ({ ...prev, [name]: null }))
    validateInput(name, parsedValue)
  }

  const handleInputBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const parsedValue =
      typeof selectedInput[name] === 'number' ? parseFloat(value) : value
    validateInput(name, parsedValue)
  }

  return {
    selectedInput,
    inputErrors,
    setSelectedInput,
    setInputErrors,
    handleInputChange,
    handleInputBlur,
  }
}

export default useInputChange
