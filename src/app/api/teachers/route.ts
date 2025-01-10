// src/app/api/teachers/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Teacher, Schedule } from '@/lib/db/schemas';
import { isAdmin } from '@/lib/auth/auth-utils';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    if (!await isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();

    const data = await request.json();
    const { scheduleId, ...teacherData } = data;

    // Verify schedule exists and user has access
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Create teacher with reference to schedule
    const teacher = await Teacher.create({
      ...teacherData,
      scheduleId,
      createdBy: userId,
      status: 'active'
    });

    return NextResponse.json({ success: true, teacher });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');

    const query: Record<string, unknown> = {};  // Use const with proper typing
    
    // If scheduleId is provided, filter by it
    if (scheduleId) {
      query.scheduleId = scheduleId;
    }

    // Add status filter if provided
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    const teachers = await Teacher
      .find(query)
      .populate('scheduleId')
      .sort({ name: 1 });

    return NextResponse.json({ success: true, teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}