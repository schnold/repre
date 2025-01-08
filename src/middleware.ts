// FILE: /src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

// Define public paths that don't require authentication
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/callback',
]);

// Define role requirements for specific paths
const ROLE_REQUIREMENTS: Record<string, string[]> = {
  '/admin': ['admin'],
  '/dashboard/analytics': ['admin', 'editor'],
  '/teachers': ['admin', 'editor'],
  '/settings': ['admin']
};

// Helper to check if path is public
const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.has(path) ||
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path.includes('.') || // Static files
    path.startsWith('/favicon');
};

// Helper to check user roles
const hasRequiredRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  return userRoles.some(role => requiredRoles.includes(role));
};

async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow public paths
  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  try {
    // Get the user session
    const session = await getSession();
    const user = session?.user;
    
    // If no session/user, redirect to login
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Get user roles
    const userRoles = (user['https://repre.io/roles'] as string[]) || [];

    // Check role requirements for the path
    const requiredRoles = ROLE_REQUIREMENTS[path];
    if (requiredRoles && !hasRequiredRole(userRoles, requiredRoles)) {
      // If user doesn't have required role, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-roles', JSON.stringify(userRoles));
    
    return response;

  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Export wrapped middleware with auth required
export default withMiddlewareAuthRequired(middleware);

// Configure middleware matching paths
export const config = {
  matcher: [
    /*
     * Match all paths except static assets and auth endpoints
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};