import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/map'];
const authRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('refresh_token');
  const isAuthPage = authRoutes.includes(request.nextUrl.pathname);
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
  
  // Всегда пропускаем API запросы
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Пропускаем публичные маршруты
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Если пользователь не аутентифицирован и пытается получить доступ к защищенному маршруту
  if (!isAuthenticated && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Если пользователь аутентифицирован и пытается получить доступ к странице входа
  if (isAuthenticated && isAuthPage) {
    const returnTo = request.nextUrl.searchParams.get('returnTo') || '/map';
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico|public).*)',
    '/login',
    '/profile',
    '/admin/:path*',
    '/news/create',
    '/news/edit/:path*'
  ]
}; 