import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Teacher, Organization } from '@/lib/db/models';
import { Types } from 'mongoose';

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

    const teachers = await Teacher.find({
      organizationId: new Types.ObjectId(params.id)
    }).lean();

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 