// FILE: src/app/api/teachers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Teacher } from "@/lib/db/schemas";


// CREATE TEACHER
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    // e.g. { name, email, subjects, color, status, etc. }

    // If you want to handle something like userId or orgId, do it here
    // e.g. body.organizationId = new Types.ObjectId(body.organizationId);

    // Minimal example:
    const newTeacher = await Teacher.create({
      name: body.name,
      email: body.email,
      subjects: body.subjects,
      color: body.color,
      status: body.status ?? "active",
      // set defaults for required fields if needed
      availability: body.availability ?? [],
      qualifications: body.qualifications ?? [],
      preferredSubstitutes: [],
      metadata: {},
    });

    return NextResponse.json({ success: true, teacher: newTeacher }, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// GET ALL TEACHERS
export async function GET() {
  try {
    await connectToDatabase();
    // If you want to filter by org, or status, etc. do so
    const allTeachers = await Teacher.find({}).lean();
    return NextResponse.json({ success: true, teachers: allTeachers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
