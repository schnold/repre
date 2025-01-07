// FILE: src/app/api/teachers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Teacher } from "@/lib/db/schemas";
import { Types } from "mongoose";

// GET a single teacher
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const teacherId = new Types.ObjectId(params.id);
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, teacher }, { status: 200 });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PUT or PATCH to update a teacher
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const teacherId = new Types.ObjectId(params.id);
    const body = await req.json();

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!updatedTeacher) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, teacher: updatedTeacher });
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE teacher
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const teacherId = new Types.ObjectId(params.id);
    await Teacher.findByIdAndDelete(teacherId);
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
