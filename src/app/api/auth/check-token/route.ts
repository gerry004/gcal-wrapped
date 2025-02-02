import { NextResponse } from 'next/server';
import { getValidToken } from '@/utils/auth';

export async function GET() {
  try {
    const accessToken = await getValidToken();
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error checking token:', error);
    return NextResponse.json({ error: 'Failed to check token' }, { status: 500 });
  }
} 