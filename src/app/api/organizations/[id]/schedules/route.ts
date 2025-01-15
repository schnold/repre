import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from "@/lib/db/mongoose";
import { Organization, Schedule } from '@/lib/db/models';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = context.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
    }

    const organization = await Organization.findById(id);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const schedules = await Schedule.find({ organizationId: id });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = context.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
    }

    const organization = await Organization.findById(id);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const data = await req.json();
    
    // Ensure optional fields are present with null values
    const scheduleData = {
      ...data,
      organizationId: id,
      createdBy: session.user.sub,
      dateRange: {
        start: null,
        end: null,
        ...data.dateRange
      },
      workingHours: {
        start: null,
        end: null,
        ...data.workingHours
      },
      settings: {
        allowedRooms: [],
        allowedSubjects: [],
        maxEventsPerDay: null,
        minEventDuration: null,
        maxEventDuration: null,
        ...data.settings
      }
    };

    const schedule = await Schedule.create(scheduleData);
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}