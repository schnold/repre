// src/app/api/teachers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Teacher } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { getSession } from '@auth0/nextjs-auth0';

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

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const teacher = await Teacher.create({
      ...data,
      createdBy: session.user.sub
    });

    return NextResponse.json(teacher);
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    return new NextResponse(
      error.name === 'ValidationError'
        ? 'Invalid teacher data'
        : 'Internal Server Error',
      { status: error.name === 'ValidationError' ? 400 : 500 }
    );
  }
}