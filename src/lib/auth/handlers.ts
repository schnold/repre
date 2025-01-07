// src/lib/auth/handlers.ts
import { User } from '../db/schemas';
import { connectToDatabase } from '../db/mongoose';

interface Auth0User {
  sub: string;
  email: string;
  name?: string;
  'https://repre.io/roles'?: string[];
}

export async function handleAuth0UserCreation(auth0User: Auth0User) {
  await connectToDatabase();

  const userData = {
    auth0Id: auth0User.sub,
    email: auth0User.email,
    name: auth0User.name || auth0User.email,
    roles: auth0User['https://repre.io/roles'] || ['teacher'],
    lastLogin: new Date(),
    settings: {
      notifications: {
        email: true,
        push: true
      }
    }
  };

  try {
    // Check if user exists
    let user = await User.findOne({ auth0Id: auth0User.sub });

    if (!user) {
      // Create new user
      user = await User.create(userData);
    } else {
      // Update existing user
      user = await User.findOneAndUpdate(
        { auth0Id: auth0User.sub },
        { 
          $set: { 
            ...userData,
            lastLogin: new Date() 
          }
        },
        { new: true }
      );
    }

    return user;
  } catch (error) {
    console.error('Error syncing Auth0 user with database:', error);
    throw error;
  }
}

export async function updateUserRoles(userId: string, roles: string[]) {
  await connectToDatabase();

  try {
    const user = await User.findOneAndUpdate(
      { auth0Id: userId },
      { $set: { roles } },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error('Error updating user roles:', error);
    throw error;
  }
}