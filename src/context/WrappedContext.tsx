"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Event {
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
}

const WrappedContext = createContext<WrappedContextType | undefined>(undefined);

export function WrappedProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  return (
    <WrappedContext.Provider value={{ events, setEvents, dateRange, setDateRange }}>
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