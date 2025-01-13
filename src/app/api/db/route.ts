import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teachers, subjects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    let data;
    switch (table) {
      case 'teachers':
        data = await db.select().from(teachers).where(eq(teachers.organizationId, organizationId));
        break;
      case 'subjects':
        data = await db.select().from(subjects).where(eq(subjects.organizationId, organizationId));
        break;
      default:
        return NextResponse.json({ error: 'Invalid table specified' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 