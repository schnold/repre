import { NextRequest, NextResponse } from 'next/server';
import { Organization, Teacher } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { getSession } from '@auth0/nextjs-auth0';
import { Types } from 'mongoose';

export const runtime = 'nodejs';

// GET /api/organizations/[id]/teachers
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
    }

    // First verify the organization exists and belongs to the admin
    const organization = await Organization.findOne({
      _id: new Types.ObjectId(id),
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get all teachers that belong to this organization
    const teachers = await Teacher.find({
      organizationIds: new Types.ObjectId(id)
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/teachers
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const data = await req.json();

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
    }

    // First verify the organization exists and belongs to the admin
    const organization = await Organization.findOne({
      _id: new Types.ObjectId(id),
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Create the teacher
    const teacher = await Teacher.create({
      ...data,
      adminId: session.user.sub,
      organizationIds: [new Types.ObjectId(id)]
    });

    // Add the teacher to the organization's teacherIds array
    await Organization.updateOne(
      { _id: new Types.ObjectId(id) },
      { $push: { teacherIds: teacher._id } }
    );

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    );
  }
}

// DELETE to remove a teacher from an organization
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId || !Types.ObjectId.isValid(teacherId)) {
      return NextResponse.json({ error: 'Invalid teacher ID' }, { status: 400 });
    }

    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify organization access
    const organization = await Organization.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Remove teacher from organization
    await Organization.findByIdAndUpdate(id, {
      $pull: { teacherIds: new Types.ObjectId(teacherId) }
    });

    return NextResponse.json({ message: 'Teacher removed from organization successfully' });
  } catch (error) {
    console.error('Error removing teacher from organization:', error);
    return NextResponse.json(
      { error: 'Failed to remove teacher from organization' },
      { status: 500 }
    );
  }
}