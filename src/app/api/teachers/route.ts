// src/app/api/teachers/route.ts
import { NextResponse } from 'next/server';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { Teacher } from '@/lib/db/models/index';
import { connectToDatabase } from '@/lib/db/connect';
import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

export const GET = withApiAuthRequired(async function getTeachers(req: Request) {
  await connectToDatabase();
  const session = await getSession(req as unknown as NextApiRequest, {} as NextApiResponse);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return new NextResponse('Organization ID is required', { status: 400 });
    }

    // Validate that organizationId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return new NextResponse('Invalid Organization ID format', { status: 400 });
    }

    const teachers = await Teacher.find({ 
      organizationId: new mongoose.Types.ObjectId(organizationId)
    })
    .sort({ name: 1 })
    .populate('organizationId', 'name'); // Optionally populate organization details

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
});

export const POST = withApiAuthRequired(async function createTeacher(req: Request) {
  await connectToDatabase();
  const session = await getSession(req as unknown as NextApiRequest, {} as NextApiResponse);
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await req.json();
    console.log('Received data:', data);

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ 
        error: 'Validation error',
        details: { name: 'Teacher name is required' }
      }, { status: 400 });
    }

    if (!data.email) {
      return NextResponse.json({ 
        error: 'Validation error',
        details: { email: 'Email is required' }
      }, { status: 400 });
    }

    if (!data.organizationId || !mongoose.Types.ObjectId.isValid(data.organizationId)) {
      return NextResponse.json({ 
        error: 'Validation error',
        details: { organizationId: 'Valid organization ID is required' }
      }, { status: 400 });
    }

    // Check if email already exists in the same organization
    const existingTeacher = await Teacher.findOne({ 
      email: data.email,
      organizationId: new mongoose.Types.ObjectId(data.organizationId)
    });
    
    if (existingTeacher) {
      return NextResponse.json({ 
        error: 'Validation error',
        details: { email: 'A teacher with this email already exists in this organization' }
      }, { status: 400 });
    }

    const teacher = await Teacher.create({
      ...data,
      organizationId: new mongoose.Types.ObjectId(data.organizationId),
      status: 'active',
      createdBy: session.user.sub,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Populate organization details before sending response
    await teacher.populate('organizationId', 'name');

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({ 
        error: 'Validation error',
        details: { email: 'A teacher with this email already exists' }
      }, { status: 400 });
    }

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError' && 'errors' in error) {
      const validationError = error as { errors: { [key: string]: { message: string } } };
      const details = Object.keys(validationError.errors).reduce((acc: { [key: string]: string }, key) => {
        acc[key] = validationError.errors[key].message;
        return acc;
      }, {});
      
      return NextResponse.json({ 
        error: 'Validation error',
        details
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to create teacher. Please try again later.'
    }, { status: 500 });
  }
});