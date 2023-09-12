import { CSSObjectWithLabel, StylesConfig, OptionProps, GroupBase } from 'react-select'
import Select, { ActionMeta, SingleValue} from 'react-select'
export interface OptionType {
  value: string;
  label: string;
}

interface DropDownSelectProps {
  selectedOption: OptionType | null;
  onChange: (selectedOption: SingleValue<OptionType>, actionMeta: ActionMeta<OptionType>) => void;
  options: OptionType[];
  label: string;
  name?: string
}

// Styles for the dropdown
const customStyles: StylesConfig<OptionType, false> = {
  option: (provided: CSSObjectWithLabel, props: OptionProps<OptionType, false, GroupBase<OptionType>>) => ({
    ...provided,
    backgroundColor: props.isSelected ? '#cacfe1' : (props.isFocused ? '#bac4e3' : '#e0e2ec'),
    color: 'black',
  }),
  control: (provided) => ({
    ...provided,
    width: 200,
    borderRadius: '12px',
    border: 'solid 2px #bcbcd3',
    backgroundColor: "#fdfdff",
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    borderRadius: '12px',
    backgroundColor: "#eef0f7",
  })
}

const DropDownSelect: React.FC<DropDownSelectProps> = ({ selectedOption, onChange, options, label, name = undefined }) => {

  return (
    <div className="flex justify-center items-center my-3 space-x-2">
      <label htmlFor="modelSelect" className="text-base font-bold">{label}</label>
      <Select 
        id="modelSelect" 
        onChange={onChange} 
        value={selectedOption}
        options={options}
        styles={customStyles} 
        aria-label={label}
        name={name}
      />
    </div>
  )
}

export default DropDownSelect;

