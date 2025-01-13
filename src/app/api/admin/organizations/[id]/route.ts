import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Organization, IOrganization } from '@/lib/db/schemas';
import { isAdmin } from '@/lib/auth/auth-utils';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const organization = await Organization.findOne({
      _id: params.id,
      $or: [
        { admins: session.user.id },
        { members: session.user.id }
      ]
    });

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const organization = await Organization.findOne({
      _id: params.id,
      admins: session.user.id
    });

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    const updates = await req.json();
    
    // Prevent updating critical fields
    delete updates.admins;
    delete updates.createdBy;
    delete updates.createdAt;

    Object.assign(organization, {
      ...updates,
      updatedAt: new Date()
    });

    await organization.save();

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to update organization:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const organization = await Organization.findOne({
      _id: params.id,
      admins: session.user.id
    });

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    await organization.deleteOne();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete organization:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 