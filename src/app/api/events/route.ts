import { NextRequest, NextResponse } from 'next/server';
import { Event, Schedule, Organization, Teacher, Subject, OrganizationTeacher } from '@/lib/db/models';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db/connect';
import mongoose from 'mongoose';

export const GET = withApiAuthRequired(async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get('scheduleId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    // Verify schedule access
    const schedule = await Schedule.findOne({
      _id: scheduleId
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Verify organization access
    const organization = await Organization.findOne({
      _id: schedule.organizationId,
      roles: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Build query
    const query: any = {
      scheduleId: new mongoose.Types.ObjectId(scheduleId),
      status: { $ne: 'cancelled' }
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      query.startTime = { 
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get events for the schedule with populated references
    const events = await Event.find(query)
      .populate('teacherId', 'name email')
      .populate('subjectId', 'name color')
      .sort({ startTime: 1 });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withApiAuthRequired(async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    if (!data.scheduleId || !data.teacherId || !data.subjectId) {
      return NextResponse.json({ error: 'Schedule ID, Teacher ID, and Subject ID are required' }, { status: 400 });
    }

    // Verify schedule access
    const schedule = await Schedule.findOne({
      _id: data.scheduleId
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Verify organization access
    const organization = await Organization.findOne({
      _id: schedule.organizationId,
      roles: session.user.sub
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify teacher belongs to organization
    const orgTeacher = await OrganizationTeacher.findOne({
      organizationId: schedule.organizationId,
      teacherId: new mongoose.Types.ObjectId(data.teacherId),
      status: 'active'
    });

    if (!orgTeacher) {
      return NextResponse.json({ error: 'Teacher not found in organization' }, { status: 404 });
    }

    // Verify subject belongs to organization
    const subject = await Subject.findOne({
      _id: new mongoose.Types.ObjectId(data.subjectId),
      organizationId: schedule.organizationId
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found in organization' }, { status: 404 });
    }

    // Validate event times against schedule settings
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    // Check if event is within schedule date range
    if (startTime < schedule.dateRange.start || endTime > schedule.dateRange.end) {
      return NextResponse.json({ 
        error: 'Event must be within schedule date range' 
      }, { status: 400 });
    }

    // Create event
    const eventData = {
      ...data,
      organizationId: schedule.organizationId,
      createdBy: session.user.sub,
      startTime,
      endTime
    };

    const event = await Event.create(eventData);
    
    // Return populated event data
    const populatedEvent = await Event.findById(event._id)
      .populate('teacherId', 'name email')
      .populate('subjectId', 'name color');

    return NextResponse.json(populatedEvent);
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
