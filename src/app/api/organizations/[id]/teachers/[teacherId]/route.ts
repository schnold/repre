import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Teacher } from '@/lib/db/models';
import { Types } from 'mongoose';

export async function PUT(
  request: NextRequest,
  context: { params: { organizationId: string; teacherId: string } }
) {
  try {
    await connectToDatabase();

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isActive } = await request.json();
    const { organizationId, teacherId } = context.params;

    // Validate params
    if (!organizationId || !teacherId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(organizationId) || !Types.ObjectId.isValid(teacherId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    // Verify that the teacher belongs to the organization
    const teacher = await Teacher.findOneAndUpdate(
      {
        _id: new Types.ObjectId(teacherId),
        organizationId: new Types.ObjectId(organizationId)
      },
      { $set: { isActive } },
      { new: true }
    );

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json(teacher.toObject());
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 