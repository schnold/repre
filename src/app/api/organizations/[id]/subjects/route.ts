import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Subject } from '@/lib/db/models/subject';
import mongoose from 'mongoose';
import { Organization } from "@/lib/db/models/organization";
import { getSession } from "@auth0/nextjs-auth0";
import { Types } from "mongoose";

// GET /api/organizations/[id]/subjects
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organization = await Organization.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
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
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, color, description } = data;

    const organization = await Organization.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Create a new subject with _id and organizationId
    const subject = {
      _id: new Types.ObjectId(),
      name,
      color: color || '#3b82f6', // Default blue color if not provided
      description,
      organizationId: new Types.ObjectId(id)
    };

    // Add the subject to the organization's subjects array
    organization.subjects.push(subject);
    await organization.save();

    // Return the newly created subject
    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]/subjects
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { subjectId } = data;

    const organization = await Organization.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Remove the subject from the organization's subjects array
    organization.subjects = organization.subjects.filter(
      (subject) => subject._id.toString() !== subjectId
    );
    await organization.save();

    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
} 