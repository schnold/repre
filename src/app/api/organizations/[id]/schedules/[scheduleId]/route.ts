import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Organization, Schedule } from '@/lib/db/models';
import { Types } from 'mongoose';

interface Params {
  params: {
    id: string;
    scheduleId: string;
  };
}

export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDatabase();

    // Check if user has access to the organization
    const organization = await Organization.findOne({
      _id: params.id,
      $or: [
        { admins: session.user.sub },
        { members: session.user.sub }
      ]
    });

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    // Delete the schedule
    const result = await Schedule.deleteOne({
      _id: new Types.ObjectId(params.scheduleId),
      organizationId: new Types.ObjectId(params.id)
    });

    if (result.deletedCount === 0) {
      return new NextResponse('Schedule not found', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 