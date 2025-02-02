"use client";
import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  value?: string;
  onSelect: (value: string) => void;
  options: string[];
  optionLabels?: string[];
  placeholder: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  value, 
  onSelect, 
  options, 
  optionLabels, 
  placeholder, 
  disabled 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="relative w-full border border-gray-300 px-4 py-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-left flex justify-between items-center"
        disabled={disabled}
      >
        <span className="truncate">
          {value ? (optionLabels?.[options.indexOf(value)] || value) : placeholder}
        </span>
        <svg className="fill-current h-4 w-4 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto overflow-x-hidden">
          {options.map((option, index) => (
            <li 
              key={option}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer truncate"
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              {optionLabels?.[index] || option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown; 