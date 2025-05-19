import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/','/map'];
const authRoutes = ['/login', "/register"];

function isTokenExpired(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true; // If token is invalid, consider it expired
  }
}

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasRefreshToken = request.cookies.has('refresh_token');
  const isAuthPage = authRoutes.includes(request.nextUrl.pathname);
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
  
  // Always pass API requests
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Pass public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if token is expired or missing
  const isTokenValid = hasRefreshToken && !isTokenExpired(refreshToken);

  // If user is not authenticated or token is expired and tries to access protected route
  if (!isTokenValid && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and tries to access auth page
  if (isTokenValid && isAuthPage) {
    const returnTo = request.nextUrl.searchParams.get('returnTo');
    if (returnTo) {
      return NextResponse.redirect(new URL(returnTo, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico|public).*)',
    '/login',
    '/register',
    '/profile',
    '/admin/:path*',
    '/news/create',
    '/news/edit/:path*'
  ]
}; 