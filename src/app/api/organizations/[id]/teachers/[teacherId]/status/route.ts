import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { Organization } from '@/lib/db/models/organization';
import { OrganizationTeacher } from '@/lib/db/models/organization-teacher';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; teacherId: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['active', 'inactive', 'substitute'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

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

    // Update the teacher's status in this organization
    const orgTeacher = await OrganizationTeacher.findOneAndUpdate(
      {
        organizationId: params.id,
        teacherId: params.teacherId
      },
      { status },
      { new: true }
    ).populate('teacherId');

    if (!orgTeacher) {
      return new NextResponse('Teacher not found in this organization', { status: 404 });
    }

    // Return the updated teacher data
    const response = {
      _id: orgTeacher.teacherId._id,
      name: orgTeacher.teacherId.name,
      email: orgTeacher.teacherId.email,
      subjects: orgTeacher.teacherId.subjects,
      status: orgTeacher.status
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating teacher status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 