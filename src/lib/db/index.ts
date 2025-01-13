'use server';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/env.mjs';

// This ensures the database connection is only created on the server
let db: ReturnType<typeof drizzle>;

if (process.env.NODE_ENV === 'production') {
  // In production, use a single connection
  const client = postgres(env.DATABASE_URL);
  db = drizzle(client);
} else {
  // In development, create a new connection for each request
  const client = postgres(env.DATABASE_URL, { max: 1 });
  db = drizzle(client);
}

export { db }; 