// src/app/api/auth/[auth0]/route.ts
import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { handleAuth0UserCreation } from '@/lib/auth/handlers';

export const GET = handleAuth({
  callback: async (request: NextRequest, response: NextResponse) => {
    try {
      // Handle the standard Auth0 callback
      const result = await handleCallback(request, response);

      // If we have a user session, sync with our database
      if (result?.session?.user) {
        await handleAuth0UserCreation(result.session.user);
      }

      return result;
    } catch (error) {
      console.error('Error in Auth0 callback:', error);
      throw error;
    }
  }
});