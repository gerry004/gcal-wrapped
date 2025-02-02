"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Event {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    date?: string;
  };
  end: {
    dateTime: string;
    date?: string;
  };
  description?: string;
  colorId?: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface WrappedContextType {
  events: Event[];
  setEvents: (events: Event[]) => void;
  dateRange: DateRange | null;
  setDateRange: (dateRange: DateRange | null) => void;
  isDataLoaded: boolean;
  setIsDataLoaded: (loaded: boolean) => void;
  isInitialized: boolean;
  defaultColorId: string;
  setDefaultColorId: (colorId: string) => void;
}

const WrappedContext = createContext<WrappedContextType | undefined>(undefined);

export function WrappedProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [defaultColorId, setDefaultColorId] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEvents = localStorage.getItem('calendarEvents');
      const storedDateRange = localStorage.getItem('calendarDateRange');
      const storedDefaultColor = localStorage.getItem('defaultColorId');
      
      if (storedEvents && storedDateRange) {
        setEvents(JSON.parse(storedEvents));
        setDateRange(JSON.parse(storedDateRange));
        setIsDataLoaded(true);
      }
      if (storedDefaultColor) {
        setDefaultColorId(storedDefaultColor);
      }
      setIsInitialized(true);
    }
  }, []);

  const handleSetEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
  };

  const handleSetDateRange = (newDateRange: DateRange | null) => {
    setDateRange(newDateRange);
    if (newDateRange) {
      localStorage.setItem('calendarDateRange', JSON.stringify(newDateRange));
    }
  };

  const handleSetIsDataLoaded = (loaded: boolean) => {
    setIsDataLoaded(loaded);
    if (!loaded) {
      localStorage.removeItem('calendarEvents');
      localStorage.removeItem('calendarDateRange');
      localStorage.removeItem('defaultColorId');
      setDefaultColorId('');
    }
  };

  const handleSetDefaultColorId = (colorId: string) => {
    setDefaultColorId(colorId);
    localStorage.setItem('defaultColorId', colorId);
  };

  return (
    <WrappedContext.Provider value={{ 
      events, 
      setEvents: handleSetEvents, 
      dateRange, 
      setDateRange: handleSetDateRange,
      isDataLoaded,
      setIsDataLoaded: handleSetIsDataLoaded,
      isInitialized,
      defaultColorId,
      setDefaultColorId: handleSetDefaultColorId
    }}>
      {children}
    </WrappedContext.Provider>
  );
}

export function useWrapped() {
  const context = useContext(WrappedContext);
  if (context === undefined) {
    throw new Error('useWrapped must be used within a WrappedProvider');
  }
  return context;
}