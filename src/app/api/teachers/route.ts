// src/app/api/teachers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Teacher } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { getSession } from '@auth0/nextjs-auth0';
import { Types } from "mongoose";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teachers = await Teacher.find({ createdBy: session.user.sub });
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Create the teacher
    const teacher = await Teacher.create({
      ...data,
      createdBy: session.user.sub
    });

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