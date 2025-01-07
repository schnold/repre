import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { handleAuth0UserCreation } from '@/lib/auth/handlers';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const user = await handleAuth0UserCreation({
      sub: session.user.sub as string,
      email: session.user.email as string,
      name: session.user.name,
      'https://repre.io/roles': session.user['https://repre.io/roles'] as string[]
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}