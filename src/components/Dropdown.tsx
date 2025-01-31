"use client";
import React from 'react';

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
  return (
    <select
      value={value}
      onChange={(e) => onSelect(e.target.value)}
      className="border border-gray-300 p-2 rounded-md w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      disabled={disabled}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option, index) => (
        <option key={option} value={option}>
          {optionLabels?.[index] || option}
        </option>
      ))}
    </select>
  );
};

export default Dropdown; 