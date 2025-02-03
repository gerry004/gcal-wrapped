"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import DatePicker from "./DatePicker";
import Dropdown from "./Dropdown";
import { useGoogleLogin } from '@react-oauth/google';
import { useWrapped } from '@/context/WrappedContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface Calendar {
  id: string;
  summary: string;
}

// Update color interface and data to match Google Calendar colors
interface CalendarColor {
  id: string;
  background: string;
  name: string;
}

const InputForm: React.FC = () => {
  const router = useRouter();
  const { setEvents, setDateRange, setIsDataLoaded, setDefaultColorId } = useWrapped();
  const { setIsAuthenticated: setAuthIsAuthenticated } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Update calendar colors data to match Google Calendar's official colors
  const calendarColors: CalendarColor[] = [
    { id: '1', background: '#7986cb', name: 'Lavender' },
    { id: '2', background: '#33b679', name: 'Sage' },
    { id: '3', background: '#8e24aa', name: 'Grape' },
    { id: '4', background: '#e67c73', name: 'Flamingo' },
    { id: '5', background: '#f6c026', name: 'Banana' },
    { id: '6', background: '#f5511d', name: 'Tangerine' },
    { id: '7', background: '#039be5', name: 'Peacock' },
    { id: '8', background: '#616161', name: 'Graphite' },
    { id: '9', background: '#3f51b5', name: 'Blueberry' },
    { id: '10', background: '#0b8043', name: 'Basil' },
    { id: '11', background: '#d60000', name: 'Tomato' }
  ];

  useEffect(() => {
    // Check for existing token on component mount
    checkExistingToken();
  }, []);

  useEffect(() => {
    // Clear errors immediately when conditions are met
    if (error === 'Please sign in with Google first' && accessToken) {
      setError(null);
    } else if (error === 'Please select a calendar' && selectedCalendar) {
      setError(null);
    } else if (error === 'Please select both start and end dates' && startDate && endDate) {
      setError(null);
    } else if (error === 'End date must be after start date' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end >= start) {
        setError(null);
      }
    }
  }, [accessToken, selectedCalendar, startDate, endDate, error]);

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
          // Update authentication state immediately
          setAuthIsAuthenticated(true);
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
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
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

    if (!selectedColor) {
      setError('Please select a calendar color');
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
          endDate: endDate,
          colorId: selectedColor
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      // Update context
      setEvents(data.events);
      setDateRange({ startDate, endDate });
      setDefaultColorId(selectedColor);
      setIsDataLoaded(true);
      router.push('/wrapped');
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-md w-[500px]">
      <h2 className="text-gray-700 text-2xl font-semibold my-2">Generate Calendar Wrapped</h2>
      <div className="mb-4 w-full">
        <button
          onClick={handleGoogleSignIn}
          disabled={!!accessToken}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full ${
            accessToken 
              ? 'bg-green-100 text-green-700 border border-green-300 cursor-default'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Image 
            src="/favicon.ico"
            alt="Google" 
            width={20} 
            height={20} 
            className="w-5 h-5"
          />
          {accessToken ? 'Connected to Google Calendar' : 'Connect Google Calendar'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1">
          <label htmlFor="calendar-select" className="text-sm font-medium text-gray-700">
            Calendar
          </label>
          <Dropdown
            value={selectedCalendar}
            onSelect={setSelectedCalendar}
            options={calendars?.map(cal => cal.id) || []}
            optionLabels={calendars?.map(cal => cal.summary) || []}
            placeholder="Select a calendar"
            disabled={!accessToken}
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label htmlFor="color-select" className="text-sm font-medium text-gray-700">
            Default Event Color
          </label>
          <Dropdown
            value={selectedColor}
            onSelect={setSelectedColor}
            options={calendarColors.map(color => color.id)}
            optionLabels={calendarColors.map(color => color.name)}
            placeholder="Select a calendar color"
            disabled={!accessToken}
            renderOption={(option, label) => (
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: calendarColors.find(c => c.id === option)?.background }}
                />
                <span>{label}</span>
              </div>
            )}
          />
        </div>
        
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
    </div>
  );
};

export default InputForm; 