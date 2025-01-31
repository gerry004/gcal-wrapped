import React from 'react';

interface DropdownProps {
  value?: string;
  onSelect: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ value, onSelect, options, placeholder, disabled }) => {
  return (
    <select
      value={value}
      onChange={(e) => onSelect(e.target.value)}
      className="border border-gray-300 p-2 rounded"
      disabled={disabled}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
};

export default Dropdown; 