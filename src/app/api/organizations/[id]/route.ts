import { NextRequest, NextResponse } from 'next/server';
import { Organization } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { getSession } from '@auth0/nextjs-auth0';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await Organization.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const session = await getSession();
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    console.log('Received update data:', data);
    console.log('Organization ID:', id);
    console.log('User ID:', session.user.sub);

    const organization = await Organization.findOneAndUpdate(
      { _id: id, adminId: session.user.sub },
      { 
        $set: {
          name: data.name,
          description: data.description,
          settings: {
            timeZone: data.settings.timeZone,
            workingHours: {
              start: data.settings.workingHours.start,
              end: data.settings.workingHours.end
            }
          }
        }
      },
      { new: true, runValidators: true }
    );

    console.log('Updated organization:', organization);

    if (!organization) {
      console.log('Organization not found');
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return new NextResponse(
      error.name === 'ValidationError' 
        ? 'Invalid organization data' 
        : 'Internal Server Error',
      { status: error.name === 'ValidationError' ? 400 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await Organization.findOneAndDelete({
      _id: id,
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}