import { FC } from 'react'
import {
  CSSObjectWithLabel,
  StylesConfig,
  OptionProps,
  GroupBase,
} from 'react-select'
import Select, { ActionMeta, SingleValue } from 'react-select'

import dynamic from 'next/dynamic'
import { OptionType } from '@/src/types/common'

interface DropdownSelectProps {
  selectedOption: OptionType | null
  onChange: (
    selectedOption: SingleValue<OptionType>,
    actionMeta: ActionMeta<OptionType>,
  ) => void
  options: OptionType[]
  label: string
  name?: string
}

// Styles for the dropdown
const customStyles: StylesConfig<OptionType, false> = {
  option: (
    provided: CSSObjectWithLabel,
    props: OptionProps<OptionType, false, GroupBase<OptionType>>,
  ) => ({
    ...provided,
    backgroundColor: props.isSelected
      ? '#cacfe1'
      : props.isFocused
        ? '#bac4e3'
        : '#e0e2ec',
    color: 'black',
  }),
  control: provided => ({
    ...provided,
    width: 200,
    borderRadius: '12px',
    border: 'solid 2px #bcbcd3',
    backgroundColor: '#fdfdff',
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    borderRadius: '12px',
    backgroundColor: '#eef0f7',
  }),
}

const StaticDropdownSelect: FC<DropdownSelectProps> = ({
  selectedOption,
  onChange,
  options,
  label,
  name = undefined,
}) => {
  const dropdownId = `${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="flex justify-center items-center my-3 space-x-2">
      <label htmlFor={name} className="text-base font-bold">
        {label}
      </label>
      <Select
        id={dropdownId}
        onChange={onChange}
        value={selectedOption}
        options={options}
        styles={customStyles}
        name={name}
      />
    </div>
  )
}

const DropdownSelect = dynamic<DropdownSelectProps>(
  () => Promise.resolve(StaticDropdownSelect),
  { ssr: false },
)

export default DropdownSelect
