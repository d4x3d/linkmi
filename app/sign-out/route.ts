import { signOut } from '@workos-inc/authkit-nextjs';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Sign out and redirect to home page
    await signOut({ returnTo: baseUrl });
  } catch (error) {
    console.error('Sign out error:', error);
    // If signOut fails, just redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }
}
