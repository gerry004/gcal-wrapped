"use client";
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useWrapped, type Event } from '@/context/WrappedContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Add this color mapping (these are Google Calendar's default colors)
const COLOR_MAP: { [key: string]: string } = {
  "1": "#7986cb", // Lavender
  "2": "#33b679", // Sage
  "3": "#8e24aa", // Grape
  "4": "#e67c73", // Flamingo
  "5": "#f6c026", // Banana
  "6": "#f5511d", // Tangerine
  "7": "#039be5", // Peacock
  "8": "#616161", // Graphite
  "9": "#3f51b5", // Blueberry
  "10": "#0b8043", // Basil
  "11": "#d60000", // Tomato
};

// Add color name mapping
const COLOR_NAMES: { [key: string]: string } = {
  "1": "Lavender",
  "2": "Sage",
  "3": "Grape",
  "4": "Flamingo",
  "5": "Banana",
  "6": "Tangerine",
  "7": "Peacock",
  "8": "Graphite",
  "9": "Blueberry",
  "10": "Basil",
  "11": "Tomato"
};

// Add this helper function at the top of the file, after COLOR_MAP
const calculateDuration = (start: string, end: string): number => {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60); // returns hours
};

// Add this helper function after calculateDuration
const calculateDailyGaps = (events: Event[]): number => {
  // Group events by date (using start date)
  const eventsByDate = events.reduce((acc: { [key: string]: Event[] }, event) => {
    const date = new Date(event.start.dateTime || event.start.date || '').toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  // Calculate gaps for each day
  let totalGapHours = 0;
  
  Object.values(eventsByDate).forEach(dailyEvents => {
    // Sort events by start time
    const sortedEvents = dailyEvents.sort((a, b) => {
      const aStart = new Date(a.start.dateTime || a.start.date || '').getTime();
      const bStart = new Date(b.start.dateTime || b.start.date || '').getTime();
      return aStart - bStart;
    });

    // Calculate gaps between consecutive events
    for (let i = 1; i < sortedEvents.length; i++) {
      const prevEventEnd = new Date(sortedEvents[i-1].end.dateTime || sortedEvents[i-1].end.date || '').getTime();
      const currentEventStart = new Date(sortedEvents[i].start.dateTime || sortedEvents[i].start.date || '').getTime();
      
      if (currentEventStart > prevEventEnd) {
        totalGapHours += (currentEventStart - prevEventEnd) / (1000 * 60 * 60);
      }
    }
  });

  return totalGapHours;
};

// Add this helper function to get chart data
const getChartData = (colorBreakdown: { [key: string]: number }) => {
  const sortedEntries = Object.entries(colorBreakdown)
    .sort(([, hoursA], [, hoursB]) => hoursB - hoursA);

  return {
    labels: sortedEntries.map(([colorId]) => 
      colorId === 'default' ? 'Default' : COLOR_NAMES[colorId]
    ),
    datasets: [{
      data: sortedEntries.map(([, hours]) => hours),
      backgroundColor: sortedEntries.map(([colorId]) => 
        COLOR_MAP[colorId] || '#9e9e9e'
      ),
      borderColor: sortedEntries.map(() => '#fff'),
      borderWidth: 1,
    }],
  };
};

// Add chart options
const chartOptions = {
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || '';
          const value = context.raw || 0;
          const percentage = ((value / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1);
          return `${label}: ${value.toFixed(1)} hours (${percentage}%)`;
        },
      },
    },
  },
};

export default function Wrapped() {
  const router = useRouter();
  const { events, dateRange, isDataLoaded, isInitialized } = useWrapped();

  useEffect(() => {
    if (isInitialized && !isDataLoaded) {
      router.push('/');
    }
  }, [isInitialized, isDataLoaded, router]);

  if (!isInitialized || !isDataLoaded) {
    return <div>Loading...</div>;
  }

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

  // Add this before the return statement
  const colorBreakdown = events.reduce((acc: { [key: string]: number }, event) => {
    const colorId = event.colorId || 'default';
    const duration = calculateDuration(
      event.start.dateTime || event.start.date || '',
      event.end.dateTime || event.end.date || ''
    );
    acc[colorId] = (acc[colorId] || 0) + duration;
    return acc;
  }, {});

  // Add this before the return statement, after calculating colorBreakdown
  const totalHours = Object.values(colorBreakdown).reduce((sum, hours) => sum + hours, 0);

  // Add this to the component, after calculating totalHours
  const totalGapHours = calculateDailyGaps(events);

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
            <div className="space-y-4">
              <p>Total Events: {events.length}</p>
              <p>Total Time in Events: {Math.round(totalHours * 10) / 10} hours</p>
              <p>Total Time Between Events: {Math.round(totalGapHours * 10) / 10} hours</p>
              <p className="text-sm text-gray-600">
                (Gaps are calculated between events within the same day)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pie Chart */}
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Time Distribution</h3>
                <div className="w-full h-[300px] flex items-center justify-center">
                  <Pie data={getChartData(colorBreakdown)} options={chartOptions} />
                </div>
              </div>

              {/* Existing breakdown list */}
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Time Breakdown by Color:</h3>
                <div className="space-y-2">
                  {Object.entries(colorBreakdown)
                    .sort(([, hoursA], [, hoursB]) => hoursB - hoursA)
                    .map(([colorId, hours]) => (
                      <div key={colorId} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLOR_MAP[colorId] || '#9e9e9e' }}
                        />
                        <span>
                          {colorId === 'default' ? 'Default' : COLOR_NAMES[colorId]}: 
                          {' '}{Math.round(hours * 10) / 10} hours
                          {' '}({Math.round((hours / totalHours) * 100)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <h2 className="text-xl font-semibold p-4 border-b">Event Timeline</h2>
            <div className="divide-y">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="p-4 hover:bg-gray-50"
                  style={{
                    borderLeft: event.colorId 
                      ? `4px solid ${COLOR_MAP[event.colorId] || '#9e9e9e'}`
                      : '4px solid #9e9e9e'
                  }}
                >
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