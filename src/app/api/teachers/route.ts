// src/app/api/teachers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Teacher, Organization } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { getSession } from '@auth0/nextjs-auth0';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

// GET /api/teachers
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all teachers for this admin
    const teachers = await Teacher.find({ adminId: session.user.sub });

    // Get all organizations for this admin to include subject details
    const organizations = await Organization.find({ adminId: session.user.sub });

    // Enhance teacher data with subject details
    const enhancedTeachers = teachers.map(teacher => {
      const teacherObj = teacher.toObject();
      teacherObj.subjects = teacherObj.subjects.map(subject => {
        const org = organizations.find(o => o._id.toString() === subject.organizationId.toString());
        const subjectDetails = org?.subjects.find(s => s._id.toString() === subject.subjectId);
        return {
          ...subject,
          name: subjectDetails?.name || 'Unknown Subject',
          color: subjectDetails?.color || '#000000',
          organizationName: org?.name || 'Unknown Organization'
        };
      });
      return teacherObj;
    });

    return NextResponse.json(enhancedTeachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

// POST /api/teachers
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { organizationId, subjects, ...teacherData } = data;

    // Verify organization exists and belongs to admin if provided
    if (organizationId) {
      const organization = await Organization.findOne({
        _id: organizationId,
        adminId: session.user.sub
      });

      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }

      // Verify all subjects exist in the organization
      if (subjects && subjects.length > 0) {
        const validSubjects = subjects.every((subjectId: string) =>
          organization.subjects.some(s => s._id.toString() === subjectId)
        );

        if (!validSubjects) {
          return NextResponse.json({ error: 'Invalid subject IDs' }, { status: 400 });
        }

        // Format subjects array with organization reference
        teacherData.subjects = subjects.map((subjectId: string) => ({
          organizationId,
          subjectId
        }));
      }
    }

    // Create teacher
    const teacher = await Teacher.create({
      ...teacherData,
      adminId: session.user.sub
    });

    // If organization provided, add teacher to organization
    if (organizationId) {
      await Organization.findByIdAndUpdate(organizationId, {
        $addToSet: { teacherIds: teacher._id }
      });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { id, ...teacherData } = data;

    // Update the teacher
    const teacher = await Teacher.findOneAndUpdate(
      { _id: id, createdBy: session.user.sub },
      {
        ...teacherData,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to update teacher' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // Delete the teacher
    const teacher = await Teacher.findOneAndDelete({
      _id: id,
      createdBy: session.user.sub
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { error: 'Failed to delete teacher' },
      { status: 500 }
    );
  }
}