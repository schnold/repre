// FILE: pages/api/auth/[...auth0].ts

import type { NextApiRequest, NextApiResponse } from 'next'
import {
  handleAuth,
  handleLogin,
  handleLogout,
  handleCallback,
  AfterCallback,
  Session,
  Claims
} from '@auth0/nextjs-auth0'
import { connectToDatabase } from '@/lib/db/connect'
import { User, IUser } from '@/lib/db/models/index'



function isValidSession(session: Session | null | undefined): session is Session {
  return !!session && !!session.user && typeof session.user.sub === 'string'
}

function isValidMongoUser(user: any): user is IUser {
  return !!user && typeof user.auth0Id === 'string' && Array.isArray(user.roles)
}

// Example: sync user with DB
async function syncUserWithDatabase(session: Session): Promise<Session> {
  if (!isValidSession(session)) {
    throw new Error('Invalid session data')
  }

  const { user } = session

  await connectToDatabase()

  const mongoUser = await User.findOneAndUpdate(
    { auth0Id: user.sub },
    {
      $setOnInsert: {
        auth0Id: user.sub,
        email: user.email || '',
        name: user.name || user.email || 'Unknown User',
        roles: ['admin']
      },
      $set: {
        lastLogin: new Date()
      }
    },
    { upsert: true, new: true, lean: true }
  )

  if (!isValidMongoUser(mongoUser)) {
    throw new Error('Invalid user data from database')
  }

  const extendedUser: Claims = {
    ...user,
    email: mongoUser.email,
    name: mongoUser.name,
    'https://repre.io/roles': mongoUser.roles,
    sub: mongoUser.auth0Id
  }

  return { ...session, user: extendedUser }
}

// Must match AfterCallback’s signature exactly:
const afterCallback: AfterCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  if (!isValidSession(session)) {
    throw new Error('Invalid session in callback')
  }
  // Minimal logic here
  return await syncUserWithDatabase(session)
}

export default handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogin(req, res, {
        returnTo: '/dashboard',
        authorizationParams: { prompt: 'login' }
      })
    } catch (error) {
      console.error('Login Error:', error)
      res
        .status(500)
        .json({ error: error instanceof Error ? error.message : 'Unknown error occurred' })
    }
  },

  async signup(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogin(req, res, {
        returnTo: '/onboarding',
        authorizationParams: { screen_hint: 'signup', prompt: 'login' }
      })
    } catch (error) {
      console.error('Signup Error:', error)
      res
        .status(500)
        .json({ error: error instanceof Error ? error.message : 'Unknown error occurred' })
    }
  },

  async logout(req: NextApiRequest, res: NextApiResponse) {
    try {
      const baseUrl = process.env.AUTH0_BASE_URL
      if (!baseUrl) throw new Error('Missing AUTH0_BASE_URL')
      await handleLogout(req, res, { returnTo: baseUrl })
    } catch (error) {
      console.error('Logout Error:', error)
      res
        .status(500)
        .json({ error: error instanceof Error ? error.message : 'Unknown error occurred' })
    }
  },

  async callback(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleCallback(req, res, {
        afterCallback
        // ✅ DO NOT add `timeout: 10000` here; it doesn't exist in `CallbackOptions`.
        // Instead, set AUTH0_HTTP_TIMEOUT=10000 in your env.
      })
    } catch (error) {
      console.error('Callback Error:', error)
      res
        .status(500)
        .json({ error: error instanceof Error ? error.message : 'Unknown error occurred' })
    }
  }
})
