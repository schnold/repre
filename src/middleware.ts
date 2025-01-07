// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';

// Define route permissions
const routePermissions = {
  '/dashboard': ['admin', 'schoolAdmin', 'teacher', 'substitute'],
  '/calendar': ['admin', 'schoolAdmin', 'teacher'],
  '/teachers': ['admin', 'schoolAdmin'],
  '/organizations': ['admin'],
  '/settings': ['admin', 'schoolAdmin'],
  '/schedule': ['teacher', 'substitute'],
  '/substitutions': ['substitute'],
};

export default async function middleware(req: NextRequest) {
  try {
    // Check if it's a protected route
    const path = req.nextUrl.pathname;
    
    // Allow public routes and static files
    if (
      path === '/' ||
      path.startsWith('/_next') ||
      path.startsWith('/api/auth') ||
      path === '/login' ||
      path === '/register'
    ) {
      return NextResponse.next();
    }

    // Get the session
    const session = await getSession();
    const user = session?.user;

    // If no user and not on public route, redirect to login
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Get user roles from Auth0 custom claim
    const userRoles = user['https://repre.io/roles'] || [];

    // Check if route requires specific roles
    const requiredRoles = routePermissions[path as keyof typeof routePermissions];
    if (requiredRoles) {
      const hasPermission = userRoles.some(role => requiredRoles.includes(role));
      if (!hasPermission) {
        // Redirect to dashboard if user doesn't have permission
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Auth0 endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};