import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/connect';
import { Organization, ISubject } from '@/lib/db/models/organization';

// DELETE /api/organizations/[id]/subjects/[subjectId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subjectId: string } }
) {
  try {
    await connectToDatabase();
    const organizationId = await params.id;
    const subjectId = await params.subjectId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Remove the subject
    organization.subjects = organization.subjects.filter(
      (subject: ISubject) => subject._id.toString() !== subjectId
    );

    await organization.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; subjectId: string } }
) {
  try {
    await connectToDatabase();
    const organizationId = await params.id;
    const subjectId = await params.subjectId;
    const data = await request.json();

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Update the subject
    const subjectIndex = organization.subjects.findIndex(
      (s: ISubject) => s._id.toString() === subjectId
    );
    if (subjectIndex === -1) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    organization.subjects[subjectIndex] = {
      ...organization.subjects[subjectIndex],
      ...data,
    };

    await organization.save();

    return NextResponse.json(organization.subjects[subjectIndex]);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    );
  }
} 