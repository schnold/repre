import { NextRequest, NextResponse } from 'next/server';
import { Organization, Teacher } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { getSession } from '@auth0/nextjs-auth0';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

// GET all teachers for an organization
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

    const organization = await Organization.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get all teachers that belong to this organization using teacherIds array
    const teachers = await Teacher.find({
      _id: { $in: organization.teacherIds }
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching organization teachers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST to add a teacher to an organization
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { teacherId } = data;

    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return NextResponse.json({ error: 'Invalid teacher ID' }, { status: 400 });
    }

    // Check if organization exists
    const organization = await Organization.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Add teacher ID to organization if not already present
    await Organization.findByIdAndUpdate(id, {
      $addToSet: { teacherIds: teacherId }
    });

    // Add organization ID to teacher if not already present
    await Teacher.findByIdAndUpdate(teacherId, {
      $addToSet: { organizationIds: id }
    });

    return NextResponse.json({ message: 'Teacher added to organization successfully' });
  } catch (error) {
    console.error('Error adding teacher to organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return NextResponse.json({ error: 'Invalid teacher ID' }, { status: 400 });
    }

    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if organization exists
    const organization = await Organization.findOne({
      _id: id,
      adminId: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Remove teacher ID from organization
    await Organization.findByIdAndUpdate(id, {
      $pull: { teacherIds: teacherId }
    });

    // Remove organization ID from teacher
    await Teacher.findByIdAndUpdate(teacherId, {
      $pull: { organizationIds: id }
    });

    return NextResponse.json({ message: 'Teacher removed from organization successfully' });
  } catch (error) {
    console.error('Error removing teacher from organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}