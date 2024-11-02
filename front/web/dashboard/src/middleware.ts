import { NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, protectedRoutes } from './constants';

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAuthenticated = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isProtectedRoute = protectedRoutes.map((route) => path.match(route)).filter((match) => match).length > 0;
  const isStatic = path.includes('/_next/static');
  const isApi = path.includes('/api/');

  if (!isAuthenticated && isProtectedRoute) {
    const absoluteURL = new URL('/', req.nextUrl.origin);

    // Redirect to login page
    return NextResponse.redirect(absoluteURL.toString());
  }

  if (isAuthenticated && !isProtectedRoute && !isStatic && !isApi) {
    const absoluteURL = new URL('/dashboard', req.nextUrl.origin);

    // Redirect to login page
    return NextResponse.redirect(absoluteURL.toString());
  }

  return NextResponse.next();
}
