import { NextResponse } from 'next/server';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { Organization } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { NextApiRequest, NextApiResponse } from 'next';

export const GET = withApiAuthRequired(async function getOrganizations(req: Request) {
  await connectToDatabase();
  const session = await getSession(req as unknown as NextApiRequest, {} as NextApiResponse);
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Find organizations where user is admin or member
    const organizations = await Organization.find({
      $or: [
        { admins: session.user.sub },  // Auth0 ID stored as string
        { members: session.user.sub }  // Auth0 ID stored as string
      ]
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
});

export const POST = withApiAuthRequired(async function createOrganization(req: Request) {
  await connectToDatabase();
  const session = await getSession(req as unknown as NextApiRequest, {} as NextApiResponse);
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await req.json();
    
    const organization = await Organization.create({
      ...data,
      admins: [session.user.sub],  // Creator becomes first admin
      members: [],
      createdBy: session.user.sub
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}); 