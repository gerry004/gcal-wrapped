"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import DatePicker from "./DatePicker";
import Dropdown from "./Dropdown";
import { useGoogleLogin } from '@react-oauth/google';
import { useWrapped } from '@/context/WrappedContext';

interface Calendar {
  id: string;
  summary: string;
}

const InputForm: React.FC = () => {
  const router = useRouter();
  const { setEvents, setDateRange, setIsDataLoaded } = useWrapped();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [events, setEventsState] = useState<any[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on component mount
    checkExistingToken();
  }, []);

  const checkExistingToken = async () => {
    try {
      const response = await fetch('/api/auth/check-token');
      const data = await response.json();
      
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        // Fetch calendars with the existing token
        const calResponse = await fetch('/api/calendar/calendars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken: data.accessToken }),
        });
        
        const { calendars } = await calResponse.json();
        setCalendars(calendars);
      }
    } catch (error) {
      console.error('Error checking token:', error);
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send the access token to our backend to store in cookie
        const response = await fetch('/api/auth/store-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            access_token: tokenResponse.access_token,
          }),
        });

        if (response.ok) {
          setAccessToken(tokenResponse.access_token);
          // Fetch calendars...
          const calResponse = await fetch('/api/calendar/calendars', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken: tokenResponse.access_token }),
          });
          
          const { calendars } = await calResponse.json();
          setCalendars(calendars);
        }
      } catch (error) {
        console.error('Error storing token:', error);
      }
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
    },
  });

  const handleGoogleSignIn = () => {
    login();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accessToken) {
      setError('Please sign in with Google first');
      return;
    }

    if (!selectedCalendar) {
      setError('Please select a calendar');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('End date must be after start date');
      return;
    }

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          accessToken,
          calendarId: selectedCalendar,
          startDate: startDate,
          endDate: endDate
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      // Update context (this will now also save to localStorage)
      setEvents(data.events);
      setDateRange({ startDate, endDate });
      setIsDataLoaded(true);
      router.push('/wrapped');
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-gray-700 text-2xl font-semibold my-2">Generate Calendar Wrapped</h2>
      <div className="mb-4 w-full">
        <button
          onClick={handleGoogleSignIn}
          className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors w-full"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <Dropdown
          value={selectedCalendar}
          onSelect={setSelectedCalendar}
          options={calendars.map(cal => cal.id)}
          optionLabels={calendars.map(cal => cal.summary)}
          placeholder="Select a calendar"
          disabled={!accessToken}
        />
        <DatePicker
          id="start-date"
          label="Start Date"
          className="w-full"
          value={startDate}
          onChange={setStartDate}
        />
        <DatePicker
          id="end-date"
          label="End Date"
          className="w-full"
          value={endDate}
          onChange={setEndDate}
        />
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white font-semibold p-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Generate Wrapped
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