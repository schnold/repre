import { handleCallback, handleLogin, handleLogout, handleProfile } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: { auth0: string[] } }) {
  const path = request.nextUrl.pathname;
  
  if (path.endsWith('/callback')) {
    return handleCallback(request, context);
  }
  
  if (path.endsWith('/login')) {
    return handleLogin({
      returnTo: '/dashboard',
      authorizationParams: {
        prompt: 'login',
      },
    })(request, context);
  }
  
  if (path.endsWith('/logout')) {
    return handleLogout({
      returnTo: '/',
    })(request, context);
  }
  
  if (path.endsWith('/me')) {
    return handleProfile(request, context);
  }
  
  throw new Error('Route not found');
} 