import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Subject } from '@/lib/db/models/subject';
import mongoose from 'mongoose';
import { Organization } from "@/lib/db/models/organization";

// GET /api/organizations/[id]/subjects
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const organizationId = params.id;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ subjects: organization.subjects || [] });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/subjects
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const organizationId = params.id;
    const data = await request.json();

    if (!data.name?.trim()) {
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Create new subject
    const newSubject = {
      _id: new mongoose.Types.ObjectId(),
      name: data.name.trim(),
      color: data.color || "#3b82f6",
    };

    // Add subject to organization
    if (!organization.subjects) {
      organization.subjects = [];
    }
    organization.subjects.push(newSubject);
    await organization.save();

    return NextResponse.json(newSubject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { subjectId } = await request.json();

    await Subject.findByIdAndDelete(subjectId);
    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
} 