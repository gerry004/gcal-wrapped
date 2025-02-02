"use client";
import { useEffect, useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Add this before the return statement, after calculating colorBreakdown
  const eventCountByColor = events.reduce((acc: { [key: string]: number }, event) => {
    const colorId = event.colorId || 'default';
    acc[colorId] = (acc[colorId] || 0) + 1;
    return acc;
  }, {});

  // Replace the longestEvent calculation with this
  const longestEvents = events.reduce((acc, event) => {
    const duration = calculateDuration(
      event.start.dateTime || event.start.date || '',
      event.end.dateTime || event.end.date || ''
    );
    
    if (acc.length === 0) {
      return [{ event, duration }];
    }
    
    if (duration > acc[0].duration) {
      return [{ event, duration }];
    }
    
    if (Math.abs(duration - acc[0].duration) < 0.01) { // Handle floating point comparison
      return [...acc, { event, duration }];
    }
    
    return acc;
  }, [] as Array<{ event: Event, duration: number }>);

  // Update the dateBreakdown calculation to include color tracking
  const dateBreakdown = events.reduce((acc: { 
    [key: string]: { 
      count: number; 
      hours: number;
      colorHours: { [colorId: string]: number };
      dominantColor?: { id: string; hours: number };
    } 
  }, event) => {
    const date = new Date(event.start.dateTime || event.start.date || '');
    const dateKey = date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
    const duration = calculateDuration(
      event.start.dateTime || event.start.date || '',
      event.end.dateTime || event.end.date || ''
    );
    const colorId = event.colorId || 'default';

    if (!acc[dateKey]) {
      acc[dateKey] = { 
        count: 0, 
        hours: 0, 
        colorHours: {} 
      };
    }
    
    acc[dateKey].count += 1;
    acc[dateKey].hours += duration;
    acc[dateKey].colorHours[colorId] = (acc[dateKey].colorHours[colorId] || 0) + duration;
    
    // Update dominant color
    const currentDominantHours = acc[dateKey].dominantColor?.hours || 0;
    if (acc[dateKey].colorHours[colorId] > currentDominantHours) {
      acc[dateKey].dominantColor = { 
        id: colorId, 
        hours: acc[dateKey].colorHours[colorId] 
      };
    }
    
    return acc;
  }, {});

  // Update the filteredEvents calculation to handle undefined summaries
  const filteredEvents = events.filter(event => 
    event.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
  );

  // Add this calculation before the return statement
  const filteredEventsTime = filteredEvents.reduce((total, event) => {
    return total + calculateDuration(
      event.start.dateTime || event.start.date || '',
      event.end.dateTime || event.end.date || ''
    );
  }, 0);

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
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Time Distribution</h3>
                <div className="w-full h-[300px] flex items-center justify-center">
                  <Pie data={getChartData(colorBreakdown)} options={chartOptions} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium">Total Time Between Events</td>
                      <td className="px-4 py-3">
                        {Math.round(totalGapHours * 10) / 10} hours
                        <div className="text-xs text-gray-500">
                          (Gaps are calculated between events within the same day)
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Longest Event{longestEvents.length > 1 ? 's' : ''}</td>
                      <td className="px-4 py-3">
                        {longestEvents.length > 0 ? (
                          <div className="space-y-3">
                            {longestEvents.map(({ event, duration }) => (
                              <div key={event.id}>
                                <div className="font-medium">{event.summary}</div>
                                <div className="text-sm text-gray-600">
                                  {Math.round(duration * 10) / 10} hours
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(event.start.dateTime || event.start.date || '')}
                                  {' → '}
                                  {formatDate(event.end.dateTime || event.end.date || '')}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          'No events'
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Events by Color</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Color</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Events</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(colorBreakdown)
                      .sort(([, hoursA], [, hoursB]) => hoursB - hoursA)
                      .map(([colorId, hours]) => (
                        <tr key={colorId}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: COLOR_MAP[colorId] || '#9e9e9e' }}
                              />
                              <span>{colorId === 'default' ? 'Default' : COLOR_NAMES[colorId]}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{eventCountByColor[colorId] || 0}</td>
                          <td className="px-4 py-3">{Math.round(hours * 10) / 10} hours</td>
                          <td className="px-4 py-3">{Math.round((hours / totalHours) * 100)}%</td>
                        </tr>
                      ))}
                    <tr className="bg-gray-50 font-medium">
                      <td className="px-4 py-3">Total</td>
                      <td className="px-4 py-3">{events.length}</td>
                      <td className="px-4 py-3">{Math.round(totalHours * 10) / 10} hours</td>
                      <td className="px-4 py-3">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Events by Date</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Events</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Most Common Color</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(dateBreakdown)
                      .sort(([dateA], [dateB]) => {
                        const a = new Date(dateA);
                        const b = new Date(dateB);
                        return a.getTime() - b.getTime();
                      })
                      .map(([date, stats]) => (
                        <tr key={date}>
                          <td className="px-4 py-3">{date}</td>
                          <td className="px-4 py-3">{stats.count}</td>
                          <td className="px-4 py-3">{Math.round(stats.hours * 10) / 10} hours</td>
                          <td className="px-4 py-3">
                            {Math.round((stats.hours / totalHours) * 100)}%
                          </td>
                          <td className="px-4 py-3">
                            {stats.dominantColor && (
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: COLOR_MAP[stats.dominantColor.id] || '#9e9e9e' }}
                                />
                                <span>
                                  {stats.dominantColor.id === 'default' ? 'Default' : COLOR_NAMES[stats.dominantColor.id]}
                                  {' '}({Math.round(stats.dominantColor.hours * 10) / 10}h)
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    <tr className="bg-gray-50 font-medium">
                      <td className="px-4 py-3">Total</td>
                      <td className="px-4 py-3">{events.length}</td>
                      <td className="px-4 py-3">{Math.round(totalHours * 10) / 10} hours</td>
                      <td className="px-4 py-3">100%</td>
                      <td className="px-4 py-3">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Event Timeline</h2>
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {searchQuery && (
              <div className="mt-4 flex items-center justify-end gap-8 text-sm px-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Found:</span>
                  <span className="font-medium">{filteredEvents.length} events</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Total time:</span>
                  <span className="font-medium">{Math.round(filteredEventsTime * 10) / 10} hours</span>
                </div>
              </div>
            )}
            <div className="divide-y">
              {filteredEvents.map((event) => (
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