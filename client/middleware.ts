import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Fix 1: Export as a named export (not just a declaration)
export const middleware = async (req: NextRequest) => {
  console.log('Middleware running on path:', req.nextUrl.pathname);
  
  try {
    // Get the authentication token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    console.log('Auth token found:', !!token);
    
    // If no token exists, redirect to login
    if (!token) {
      console.log('Redirecting to login');
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, still redirect to login for security
    const loginUrl = new URL('/auth/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
};

// Make sure this matcher configuration is correct
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