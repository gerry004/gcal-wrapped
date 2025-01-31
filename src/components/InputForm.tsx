"use client";

import { useRouter } from 'next/navigation';
import React, { useState } from "react";
import DatePicker from "./DatePicker";
import Dropdown from "./Dropdown";
import { useGoogleLogin } from '@react-oauth/google';

const InputForm: React.FC = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log('Token Response:', tokenResponse);
      setAccessToken(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  const handleGoogleSignIn = () => {
    login();
  };

  const handleGetEvents = async () => {
    if (!accessToken) {
      alert('Please sign in with Google first');
      return;
    }

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });
      
      const { events } = await response.json();
      setEvents(events);
      console.log('Today\'s events:', events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/wrapped');
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-gray-700 text-2xl font-semibold my-2">Generate Calendar Wrapped</h2>
      <div className="flex gap-4 mb-4 w-full">
        <button
          onClick={handleGoogleSignIn}
          className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors w-full"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
        <button
          onClick={handleGetEvents}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors w-full"
        >
          Get Today's Events
        </button>
      </div>
      
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

      {events.length > 0 && (
        <div className="mt-4 w-full">
          <h3 className="text-lg font-semibold mb-2">Today's Events:</h3>
          <ul className="space-y-2">
            {events.map((event, index) => (
              <li key={index} className="p-2 bg-white rounded shadow">
                {event.summary}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InputForm; 