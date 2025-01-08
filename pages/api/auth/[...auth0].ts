// FILE: /pages/api/auth/[...auth0].ts
import { 
  handleAuth, 
  handleLogin, 
  handleLogout,
  handleCallback,
  Session,
  
} from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";

// Create base handler
export default handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogin(req, res, {
        returnTo: "/dashboard",
        authorizationParams: {
          prompt: "login",
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(error instanceof Error ? 500 : 400).end(error instanceof Error ? error.message : "Unknown error");
    }
  },

  async signup(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogin(req, res, {
        returnTo: "/onboarding",
        authorizationParams: {
          screen_hint: "signup",
          prompt: "login",
        },
      });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(error instanceof Error ? 500 : 400).end(error instanceof Error ? error.message : "Unknown error");
    }
  },

  async logout(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogout(req, res, {
        returnTo: `${process.env.AUTH0_BASE_URL}`,
      });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(error instanceof Error ? 500 : 400).end(error instanceof Error ? error.message : "Unknown error");
    }
  },

  async callback(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleCallback(req, res, {
        afterCallback: (_req, _res, session: Session) => {
          // You can modify the session here if needed
          return session;
        },
      });
    } catch (error) {
      console.error("Callback Error:", error);
      res.status(error instanceof Error ? 500 : 400).end(error instanceof Error ? error.message : "Unknown error");
    }
  },
});