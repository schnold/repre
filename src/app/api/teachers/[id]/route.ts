// FILE: src/app/api/teachers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Teacher, Organization } from "@/lib/db/models";
import { Types } from "mongoose";
import { getSession } from '@auth0/nextjs-auth0';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

// GET a single teacher
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await Teacher.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get all organizations for this admin to include subject details
    const organizations = await Organization.find({ adminId: session.user.sub });

    // Enhance teacher data with subject details
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

    return NextResponse.json(teacherObj);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      { error: "Failed to fetch teacher" },
      { status: 500 }
    );
  }
}

// PUT or PATCH to update a teacher
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { organizationId, subjects, ...teacherData } = data;

    // Verify teacher exists and belongs to admin
    const teacher = await Teacher.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Handle subject updates if provided
    if (organizationId && subjects) {
      // Verify organization exists and belongs to admin
      const organization = await Organization.findOne({
        _id: organizationId,
        adminId: session.user.sub
      });

      if (!organization) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      // Verify all subjects exist in the organization
      const validSubjects = subjects.every((subjectId: string) =>
        organization.subjects.some(s => s._id.toString() === subjectId)
      );

      if (!validSubjects) {
        return NextResponse.json({ error: "Invalid subject IDs" }, { status: 400 });
      }

      // Format subjects array with organization reference
      teacherData.subjects = subjects.map((subjectId: string) => ({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        subjectId
      }));

      // Update organization's teacherIds if not already present
      await Organization.findByIdAndUpdate(organizationId, {
        $addToSet: { teacherIds: teacher._id }
      });
    }

    // Update teacher
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      { $set: teacherData },
      { new: true }
    );

    if (!updatedTeacher) {
      return NextResponse.json({ error: "Failed to update teacher" }, { status: 404 });
    }

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

// DELETE teacher
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify teacher exists and belongs to admin
    const teacher = await Teacher.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Remove teacher from all organizations they belong to
    await Organization.updateMany(
      { teacherIds: teacher._id },
      { $pull: { teacherIds: teacher._id } }
    );

    // Delete the teacher
    await Teacher.findByIdAndDelete(id);

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
