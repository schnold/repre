// FILE: /pages/api/auth/[...auth0].ts
import { 
  handleAuth,
  handleLogin,
  handleLogout,
  handleCallback,
  AfterCallback,
  Session,
  UserProfile
} from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User, IUser } from "@/lib/db/schemas";

// Type guard for session
function isValidSession(session: Session | null | undefined): session is Session {
  return !!session && !!session.user && typeof session.user.sub === 'string';
}

// Type guard for MongoDB user
function isValidMongoUser(user: any): user is IUser {
  return !!user && typeof user.auth0Id === 'string' && Array.isArray(user.roles);
}

async function syncUserWithDatabase(session: Session): Promise<Session> {
  // Guard clause for invalid session
  if (!isValidSession(session)) {
    throw new Error('Invalid session data');
  }

  const { user } = session;

  try {
    await connectToDatabase();

    const mongoUser = await User.findOneAndUpdate(
      { auth0Id: user.sub },
      {
        $setOnInsert: {
          auth0Id: user.sub,
          email: user.email || '',
          name: user.name || user.email || 'Unknown User',
          roles: ['admin'],
        },
        $set: {
          lastLogin: new Date()
        }
      },
      {
        upsert: true,
        new: true,
        lean: true,
      }
    );

    // Type guard for MongoDB user
    if (!isValidMongoUser(mongoUser)) {
      throw new Error('Invalid user data from database');
    }

    // Create a properly typed user profile
    const extendedUser: UserProfile = {
      ...user,
      email: mongoUser.email,
      name: mongoUser.name,
      'https://repre.io/roles': mongoUser.roles,
      sub: mongoUser.auth0Id
    };

    // Return updated session
    return {
      ...session,
      user: extendedUser
    };
  } catch (error) {
    console.error('Error syncing user:', error);
    // If anything fails, return original session
    return session;
  }
}

const afterCallback: AfterCallback = async (req, res, session) => {
  if (!isValidSession(session)) {
    throw new Error('Invalid session in callback');
  }

  try {
    return await syncUserWithDatabase(session);
  } catch (error) {
    console.error('Callback error:', error);
    return session;
  }
};

export default handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogin(req, res, {
        returnTo: "/dashboard",
        authorizationParams: {
          prompt: "login",
        }
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  },

  async signup(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogin(req, res, {
        returnTo: "/onboarding",
        authorizationParams: {
          screen_hint: "signup",
          prompt: "login",
        }
      });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  },

  async logout(req: NextApiRequest, res: NextApiResponse) {
    try {
      const baseUrl = process.env.AUTH0_BASE_URL;
      if (!baseUrl) {
        throw new Error("Missing AUTH0_BASE_URL environment variable");
      }

      await handleLogout(req, res, {
        returnTo: baseUrl
      });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  },

  async callback(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleCallback(req, res, {
        afterCallback
      });
    } catch (error) {
      console.error("Callback Error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  }
});