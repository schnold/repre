import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export default handleAuth({
  // When the user logs in, redirect them to /dashboard
  login: handleLogin({
    returnTo: "/dashboard",
    // optionally pass other authorizationParams
  }),

  // When the user signs up, you can send them to /onboarding
  signup: handleLogin({
    returnTo: "/onboarding",
    authorizationParams: {
      screen_hint: "signup",
    },
  }),
});