import { NextRequest, NextResponse } from 'next/server';
import { Teacher } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { getSession } from '@auth0/nextjs-auth0';

// GET /api/admin/teachers
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teachers = await Teacher.find({ adminId: session.user.sub });
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/teachers
export async function POST(req: NextRequest) {
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
      adminId: session.user.sub
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 