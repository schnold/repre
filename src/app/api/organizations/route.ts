import { NextRequest, NextResponse } from 'next/server';
import { Organization } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { getSession } from '@auth0/nextjs-auth0';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizations = await Organization.find({ createdBy: session.user.sub });
    
    // Return 404 only if no organizations are found
    if (organizations.length === 0) {
      return NextResponse.json({ error: 'No organizations found' }, { status: 404 });
    }

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();

    const organization = await Organization.create({
      name: data.name,
      description: data.description,
      type: 'school', // default type
      createdBy: session.user.sub,
      settings: {
        timeZone: data.timeZone || 'UTC',
        workingHours: {
          start: data.workingHours?.start || '09:00',
          end: data.workingHours?.end || '17:00'
        }
      }
    });

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return new NextResponse(
      error.name === 'ValidationError' 
        ? 'Invalid organization data' 
        : 'Internal Server Error',
      { status: error.name === 'ValidationError' ? 400 : 500 }
    );
  }
} 