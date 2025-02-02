'use server'

import { type Event } from '@/context/WrappedContext';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface WrappedData {
  events: Event[] | null;
  dateRange: DateRange | null;
}

// Single cache object instead of separate variables
const cache: WrappedData = {
  events: null,
  dateRange: null
};

export async function setWrappedData(events: Event[], dateRange: DateRange): Promise<void> {
  if (!events || !dateRange) {
    throw new Error('Invalid wrapped data provided');
  }
  
  cache.events = events;
  cache.dateRange = dateRange;
}

export async function getWrappedData(): Promise<WrappedData> {
  return { ...cache }; // Return a shallow copy to prevent direct cache manipulation
} 