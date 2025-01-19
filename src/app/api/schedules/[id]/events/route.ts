import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from "@/lib/db/mongoose";
import { Schedule, Event } from "@/lib/db/models";
import mongoose from 'mongoose';

// GET all events for a schedule
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid schedule ID" }, { status: 400 });
    }

    // First check if the schedule exists and user has access to it
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    // Get all events for this schedule
    const events = await Event.find({ scheduleId: id });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching schedule events:', error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST to create a new event
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid schedule ID" }, { status: 400 });
    }

    // Check if schedule exists
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const data = await req.json();
    const event = await Event.create({
      ...data,
      scheduleId: id,
      createdBy: session.user.sub
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
} 