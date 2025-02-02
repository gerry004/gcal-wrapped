import { cookies } from 'next/headers';
import { google } from 'googleapis';

const COOKIE_NAME = 'gcal_auth';

interface TokenData {
  access_token: string;
  refresh_token?: string | null;
  expiry_date: number;
}

interface WrappedData {
  events: any[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const WRAPPED_COOKIE_NAME = 'gcal_wrapped_data';

// Create the OAuth client with environment variables
export const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
);

export async function setTokenCookie(tokens: TokenData) {
  // Set cookie to expire in 7 days
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(tokens), {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export async function getValidToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(COOKIE_NAME);
  
  if (!tokenCookie?.value) {
    return null;
  }

  const tokens: TokenData = JSON.parse(tokenCookie.value);
  
  // Check if current token is expired
  if (Date.now() >= tokens.expiry_date && tokens.refresh_token) {
    try {
      const response = await oauth2Client.refreshAccessToken();
      const newTokens: TokenData = {
        access_token: response.credentials.access_token!,
        refresh_token: response.credentials.refresh_token,
        expiry_date: Date.now() + (response.credentials.expiry_date || 3600) * 1000,
      };
      await setTokenCookie(newTokens);
      return newTokens.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  return tokens.access_token;
}

export async function setWrappedDataCookie(data: WrappedData) {
  const cookieStore = await cookies();
  cookieStore.set(WRAPPED_COOKIE_NAME, JSON.stringify(data), {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export async function getWrappedData(): Promise<WrappedData | null> {
  const cookieStore = await cookies();
  const wrappedCookie = cookieStore.get(WRAPPED_COOKIE_NAME);
  
  if (!wrappedCookie?.value) {
    return null;
  }

  return JSON.parse(wrappedCookie.value);
} 