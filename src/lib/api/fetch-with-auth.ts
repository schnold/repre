import type { UserProfile } from '@auth0/nextjs-auth0/client';

interface FetchWithAuthOptions extends RequestInit {
  user: UserProfile | null | undefined;
}

export async function fetchWithAuth(url: string, options: FetchWithAuthOptions) {
  const { user, headers = {}, ...rest } = options;

  if (!user?.sub) {
    throw new Error('User not authenticated');
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'x-user-sub': user.sub,
    ...headers,
  };

  const response = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: authHeaders,
  });

  return response;
} 