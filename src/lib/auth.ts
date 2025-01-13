import { NextAuthOptions, DefaultSession } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizations: Array<{
        organizationId: string;
        role: 'admin' | 'teacher' | 'substitute' | 'viewer';
      }>;
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string;
      }
      return session;
    }
  }
}; 