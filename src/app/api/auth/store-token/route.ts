import { NextRequest, NextResponse } from 'next/server';
import { setTokenCookie } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();
    
    // Store token in cookie
    await setTokenCookie({
      access_token,
      expiry_date: Date.now() + 3600 * 1000, // 1 hour expiry
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing token:', error);
    return NextResponse.json({ error: 'Failed to store token' }, { status: 500 });
  }
} 