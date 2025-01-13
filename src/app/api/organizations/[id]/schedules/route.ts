import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Organization } from '@/lib/db/models';
import { ISchedule } from '@/lib/db/schemas';
import { model, models } from 'mongoose';
import { Types } from 'mongoose';

const Schedule = models.Schedule || model<ISchedule>('Schedule');

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
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

    const schedules = await Schedule.find({
      organizationId: new Types.ObjectId(params.id)
    }).lean();

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 