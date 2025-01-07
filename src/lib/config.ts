// src/lib/config.ts

// Auth0
export const auth0Config = {
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
  };
  
  // MongoDB
  export const mongoConfig = {
    uri: process.env.MONGODB_URI,
  };
  
  // App URLs
  export const appConfig = {
    url: process.env.NEXT_PUBLIC_APP_URL,
  };
  
  // Validate required environment variables
  const requiredEnvVars = [
    'AUTH0_SECRET',
    'AUTH0_BASE_URL',
    'AUTH0_ISSUER_BASE_URL',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'MONGODB_URI',
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }