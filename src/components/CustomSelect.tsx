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
  dropdownClass?: string; // New prop for custom classes
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  dropdownClass,
  selectedClass
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
          className={cn(
            'absolute z-100 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto',
            dropdownClass
          )}
        >
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={cn(
                'px-4 py-2 text-sm cursor-pointer hover:bg-gray-100',
                option.value === value
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-gray-900'
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
