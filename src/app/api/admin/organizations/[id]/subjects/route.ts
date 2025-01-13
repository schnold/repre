import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/api-handler';
import { Subject, Organization } from '@/lib/db/schemas';
import { z } from 'zod';

const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
  description: z.string().optional(),
  requirements: z.object({
    qualifications: z.array(z.string()).optional(),
    minExperience: z.number().min(0).optional()
  }).optional()
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (session) => {
    const organization = await Organization.findOne({
      _id: params.id,
      members: session.user.id
    });

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    const subjects = await Subject.find({ organizationId: params.id });
    return NextResponse.json(subjects);
  });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (session) => {
    const organization = await Organization.findOne({
      _id: params.id,
      admins: session.user.id
    });

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    const data = await req.json();
    
    try {
      const validatedData = subjectSchema.parse(data);
      
      const subject = new Subject({
        ...validatedData,
        organizationId: params.id
      });

      await subject.save();
      return NextResponse.json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new NextResponse(JSON.stringify({
          message: 'Validation error',
          errors: error.errors
        }), { status: 400 });
      }
      throw error;
    }
  });
} 