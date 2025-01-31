"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { getWrappedData } from '@/app/actions';
import { useWrapped } from '@/context/WrappedContext';

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

export default function Wrapped() {
  const router = useRouter();
  const { events, dateRange } = useWrapped();

  useEffect(() => {
    if (!events.length) {
      router.push('/');
      return;
    }
  }, [events, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 mt-16">
        <h1 className="text-3xl font-bold text-center mb-6">Your Calendar Wrapped</h1>
        
        {dateRange && (
          <p className="text-center text-gray-600 mb-8">
            Events from {new Date(dateRange.startDate).toLocaleDateString()} to{' '}
            {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        )}

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p>Total Events: {events.length}</p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <h2 className="text-xl font-semibold p-4 border-b">Event Timeline</h2>
            <div className="divide-y">
              {events.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50">
                  <h3 className="font-semibold">{event.summary}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(event.start.dateTime || event.start.date || '')}
                    {' → '}
                    {formatDate(event.end.dateTime || event.end.date || '')}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 