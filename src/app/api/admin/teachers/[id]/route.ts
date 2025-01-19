import { NextRequest, NextResponse } from 'next/server';
import { Teacher, OrganizationTeacher } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { getSession } from '@auth0/nextjs-auth0';

// GET /api/admin/teachers/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await Teacher.findOne({
      _id: params.id,
      adminId: session.user.sub
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get all organizations this teacher belongs to
    const organizationTeachers = await OrganizationTeacher.find({
      teacherId: params.id,
      status: 'active'
    })
    .populate('organizationId', 'name');

    return NextResponse.json({
      teacher,
      organizations: organizationTeachers
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/admin/teachers/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const teacher = await Teacher.findOneAndUpdate(
      {
        _id: params.id,
        adminId: session.user.sub
      },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/teachers/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, set the teacher as inactive in all organizations
    await OrganizationTeacher.updateMany(
      { teacherId: params.id },
      { $set: { status: 'inactive' } }
    );

    // Then, set the teacher's status to inactive
    const teacher = await Teacher.findOneAndUpdate(
      {
        _id: params.id,
        adminId: session.user.sub
      },
      { $set: { status: 'inactive' } },
      { new: true }
    );

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 