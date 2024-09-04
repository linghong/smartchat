import React, { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select an option'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div id={id} className="relative">
      <div
        className="select-trigger w-full p-2 border border-gray-300 rounded-md cursor-pointer bg-white text-left"
        onClick={handleToggle}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                option.value === value
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-gray-900'
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
