import { FC } from 'react'

interface CheckboxProps {
  label: string;
}

const Checkbox: FC<CheckboxProps>
 = ({label}) => {

  return (
    <div className="my-2">     
      <input 
        type="checkbox" 
        id="checkbox" 
        className="rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      />
      <label 
        htmlFor="checkbox" className="mx-3 text-gray-700"
      >
        {label}
      </label>
    </div>
  )
 }
 export default Checkbox