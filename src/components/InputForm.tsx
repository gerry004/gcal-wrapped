"use client";

import { useRouter } from 'next/navigation';
import React, { useState } from "react";
import DatePicker from "./DatePicker";
import Dropdown from "./Dropdown";

const InputForm: React.FC = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    router.push('/wrapped');
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-gray-700 text-2xl font-semibold my-2">Generate Calendar Wrapped</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <Dropdown
          value={selectedOption}
          onSelect={setSelectedOption}
          options={['Option 1', 'Option 2', 'Option 3']} // Replace with your options
          placeholder="Select an option"
        />
        <DatePicker
          id="start-date"
          label="Start Date"
          className="w-full"
        />
        <DatePicker
          id="end-date"
          label="End Date"
          className="w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white font-semibold p-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default InputForm; 