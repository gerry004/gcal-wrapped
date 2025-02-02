import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { getValidToken, oauth2Client } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { calendarId = 'primary', startDate, endDate } = await request.json();
    
    // Get valid token from cookie
    const accessToken = await getValidToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Set time to start of day for start date and end of day for end date
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      colorId: true,
    });

    return NextResponse.json({ events: response.data.items });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
} 