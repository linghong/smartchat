import React, { useState } from 'react';
import { cn } from '@/src/lib/utils'; // Import the cn function

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
  containerClass?: string;
  selectedClass?: string;
  dropdownClass?: string;
  dropdownItemClass?: string; 
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  containerClass,
  dropdownClass,
  selectedClass,
  dropdownItemClass
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div id={id} className={cn("relative", containerClass)}>
      <div
        role="combobox"
        aria-controls="options"
        aria-expanded="false"
        className={cn(
          'select-trigger w-full p-2 border border-gray-300 rounded-md cursor-pointer bg-gray-50 text-sm text-left',
          selectedClass
        )}
        onClick={handleToggle}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </div>
      {isOpen && (
        <ul
          id="options"
          role="list"
          className={cn(
            'absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto',
            dropdownClass
          )}
        >
          {options.map((option, index) => (
            <li
              key={`${option.value}-${index}`}
              role="option"
              aria-selected={option.value === selectedOption?.value}
              onClick={() => handleSelect(option)}
              className={cn(
                'px-4 py-2 text-sm cursor-pointer hover:bg-gray-100',
                option.value === value
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-gray-900', 
                dropdownItemClass
              )}
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
