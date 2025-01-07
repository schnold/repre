import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired({
  returnTo: '/login',
});

export const config = {
  matcher: [
    '/app/:path*',  // Protect all routes under /app
    '/api/:path*',  // Protect all API routes
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|$).*)',
  ],
};