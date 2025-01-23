import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/map'];

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('refresh_token');
  const isAuthPage = request.nextUrl.pathname === '/login';
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Store the original URL in case we need to redirect back after login
  const returnTo = request.nextUrl.pathname + request.nextUrl.search;

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and trying to access protected route
  if (!isAuthenticated && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', returnTo);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to returnTo or default page if authenticated user tries to access login
  if (isAuthenticated && isAuthPage) {
    const returnTo = request.nextUrl.searchParams.get('returnTo') || '/map';
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Add routes that need authentication or special handling
    '/login',
    '/profile',
    '/admin/:path*',
    '/news/create',
    '/news/edit/:path*'
  ]
}; 