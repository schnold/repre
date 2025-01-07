// src/app/api/auth/[...auth0]/route.ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/onboarding'
  }),
  signup: handleLogin({
    returnTo: '/onboarding',
    authorizationParams: {
      screen_hint: 'signup'
    }
  })
});