import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { Admin } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import { Organization } from '@/lib/db/models/organization';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Find or create admin
    let admin = await Admin.findOne({ auth0Id: session.user.sub });
    if (!admin) {
      admin = await Admin.create({
        auth0Id: session.user.sub,
        email: session.user.email,
        name: session.user.name || undefined
      });
    }

    // If admin has no selected organization
    if (!admin.selectedOrganizationId) {
      // Try to find the first available organization
      const firstOrg = await Organization.findOne({ adminId: session.user.sub });
      if (firstOrg) {
        admin.selectedOrganizationId = firstOrg._id;
        await admin.save();
      } else {
        // No organizations available
        return NextResponse.json({ organizationId: null });
      }
    } else {
      // Verify if the selected organization still exists and belongs to the admin
      const organization = await Organization.findOne({
        _id: admin.selectedOrganizationId,
        adminId: session.user.sub
      });
      
      if (!organization) {
        // Selected organization no longer exists or doesn't belong to admin
        admin.selectedOrganizationId = undefined;
        await admin.save();
        return NextResponse.json({ organizationId: null });
      }
    }

    return NextResponse.json({ organizationId: admin.selectedOrganizationId });
  } catch (error) {
    console.error('Error getting selected organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = await req.json();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Verify the organization exists and belongs to the admin
    const organization = await Organization.findOne({
      _id: organizationId,
      adminId: session.user.sub
    });
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Find or create admin
    let admin = await Admin.findOne({ auth0Id: session.user.sub });
    if (!admin) {
      admin = await Admin.create({
        auth0Id: session.user.sub,
        email: session.user.email,
        name: session.user.name || '',
        selectedOrganizationId: organizationId
      });
    } else {
      admin.selectedOrganizationId = organizationId;
      admin.email = session.user.email;
      admin.name = session.user.name || '';
      await admin.save();
    }

    return NextResponse.json({ organizationId: admin.selectedOrganizationId });
  } catch (error) {
    console.error('Error updating selected organization:', error);
    return NextResponse.json(
      { error: 'Failed to update selected organization' },
      { status: 500 }
    );
  }
} 