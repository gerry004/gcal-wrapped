import React from 'react';

interface DatePickerProps {
  id: string;
  label: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ id, label, className }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="text-white">{label}</label>
      <input type="date" id={id} className="border border-gray-300 p-2 rounded" />
    </div>
  );
};

export default DatePicker; 