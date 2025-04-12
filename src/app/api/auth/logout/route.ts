import { NextResponse } from 'next/server';
import { withApi } from '@/lib/utils/withApi';

export const POST = withApi(async () => {
  // Create a response that will clear the auth cookie
  const response = NextResponse.json(
    { data: null, message: 'Logged out successfully' },
    { status: 200 }
  );
  
  // Clear the auth cookie
  response.cookies.set('next-auth.session-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0, // Expire immediately
  });
  
  return response;
}, {
  preventDb: true, // No need to connect to the database for logout
  protected: false, // Allow even if not authenticated
});
