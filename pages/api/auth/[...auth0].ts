import { handleAuth, handleLogin, handleLogout } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";

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

  // Add a custom logout handler that redirects to the Auth0 logout endpoint
  async logout(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Use handleLogout to clear the session
      await handleLogout(req, res, {
        returnTo: process.env.AUTH0_BASE_URL,
      });
    } catch (error) {
      console.error("Logout Error:", error);
      if (error instanceof Error) {
        res.status(500).end("Logout Error: " + error.message);
      } else {
        res.status(500).end("An unknown error occurred during logout");
      }
    }
  },
});
