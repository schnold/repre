import { NextRequest, NextResponse } from 'next/server';
import { Organization, Teacher, OrganizationTeacher } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

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

    const organizationTeachers = await OrganizationTeacher.find({ organizationId: id })
      .populate('teacherId')
      .lean();

    const teachers = organizationTeachers.map(ot => ({
      ...ot.teacherId,
      organizationTeacherStatus: ot.status
    }));

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    await cookies(); // Ensure cookies are awaited
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Received teacher data:', data);

    // Check if this is an existing teacher being assigned
    if (data.teacherId) {
      // Assign existing teacher to organization
      const existingAssignment = await OrganizationTeacher.findOne({
        organizationId: id,
        teacherId: data.teacherId
      });

      if (existingAssignment) {
        return NextResponse.json(
          { error: 'Teacher already assigned to this organization' },
          { status: 400 }
        );
      }

      const organizationTeacher = await OrganizationTeacher.create({
        organizationId: id,
        teacherId: data.teacherId,
        status: 'active'
      });

      return NextResponse.json(organizationTeacher);
    } else {
      // Create new teacher and assign to organization
      const teacherData = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        subjects: data.subjects,
        color: data.color,
        maxHoursPerDay: data.maxHoursPerDay,
        maxHoursPerWeek: data.maxHoursPerWeek,
        availability: data.availability,
        preferences: data.preferences,
        createdBy: session.user.sub
      };

      const teacher = await Teacher.create(teacherData);

      const organizationTeacher = await OrganizationTeacher.create({
        organizationId: id,
        teacherId: teacher._id,
        status: 'active'
      });

      const populatedTeacher = await Teacher.findById(teacher._id);
      return NextResponse.json({
        ...organizationTeacher.toObject(),
        teacherId: populatedTeacher
      });
    }
  } catch (error: any) {
    console.error('Error creating/assigning teacher:', error);
    return NextResponse.json(
      { error: error.name === 'ValidationError' ? 'Invalid teacher data' : 'Internal Server Error' },
      { status: error.name === 'ValidationError' ? 400 : 500 }
    );
  }
}