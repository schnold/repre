import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';

// List of public paths that don't require authentication
const publicPaths = new Set([
  '/',
  '/landing',
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/callback',
]);

// Helper to check if path is public
const isPublicPath = (path: string) => {
  return publicPaths.has(path) ||
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path.endsWith('.ico') ||
    path.endsWith('.png') ||
    path.endsWith('.svg');
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
    
    // If no session, redirect to login
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check user roles if needed
    const userRoles = session.user['https://repre.io/roles'] || [];
    
    // Add any role-based routing logic here
    // For example:
    if (path.startsWith('/admin') && !userRoles.includes('admin')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Export the middleware with auth required wrapper
export default withMiddlewareAuthRequired(middleware);

// Configure middleware matching paths
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