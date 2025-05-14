import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  console.log('Middleware running on path:', req.nextUrl.pathname);
  
  // Look for session cookies - NextAuth uses several possible cookie names
  const hasSessionCookie = req.cookies.has('next-auth.session-token') || 
                          req.cookies.has('__Secure-next-auth.session-token') ||
                          req.cookies.has('__Host-next-auth.session-token');
  
  if (!hasSessionCookie) {
    console.log('No session cookie found, redirecting to login');
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  console.log('Session cookie found, proceeding');
  return NextResponse.next();
}

// Keep your existing matcher configuration
export const config = {
  matcher: [
    '/posts/create',
    '/posts/edit/:path*',
    '/chat',
    '/chat/:path*',
    '/settings',
    '/settings/:path*',
    '/profile',
    '/profile/:path*',
    '/community',
    '/community/:path*',
    '/dashboard/:path*',
  ],
};