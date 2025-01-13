// src/app/api/teachers/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Teacher } from '@/lib/db/models';
import { ITeacher } from '@/lib/db/schemas';
import { Types } from 'mongoose';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const teachers = await Teacher.find({
      organizationId: new Types.ObjectId(organizationId)
    }).lean();

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    const teacher = new Teacher({
      ...body,
      organizationId: new Types.ObjectId(body.organizationId),
      createdBy: session.user.sub
    });

    await teacher.save();
    return NextResponse.json(teacher.toObject());
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}