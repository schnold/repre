import { NextRequest, NextResponse } from 'next/server';
import { Organization, Admin } from '@/lib/db/models';
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

    const organizations = await Organization.find({ adminId: session.user.sub });
    
    // Get the admin to include the selected organization
    const admin = await Admin.findOne({ auth0Id: session.user.sub });
    
    return NextResponse.json({
      organizations,
      selectedOrganizationId: admin?.preferences?.selectedOrganizationId
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
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

    // Create the organization
    const organization = await Organization.create({
      name: data.name,
      description: data.description,
      adminId: session.user.sub,
      timeZone: data.timeZone || 'UTC',
      workingHours: {
        start: data.workingHours?.start || '09:00',
        end: data.workingHours?.end || '17:00'
      }
    });

    // Find or create admin and set this as the selected organization if it's their first one
    let admin = await Admin.findOne({ auth0Id: session.user.sub });
    if (!admin) {
      admin = await Admin.create({
        auth0Id: session.user.sub,
        email: session.user.email,
        name: session.user.name || undefined,
        preferences: {
          selectedOrganizationId: organization._id
        }
      });
    } else if (!admin.preferences?.selectedOrganizationId) {
      // If admin exists but has no selected organization, set this one
      admin.preferences = {
        ...admin.preferences,
        selectedOrganizationId: organization._id
      };
      await admin.save();
    }

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return new NextResponse(
      error.name === 'ValidationError' 
        ? 'Invalid organization data' 
        : 'Internal Server Error',
      { status: error.name === 'ValidationError' ? 400 : 500 }
    );
  }
}

// PATCH endpoint to update selected organization
export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { organizationId } = data;

    if (!organizationId) {
      return new NextResponse('Organization ID is required', { status: 400 });
    }

    // Verify the organization exists and belongs to this admin
    const organization = await Organization.findOne({
      _id: organizationId,
      adminId: session.user.sub
    });

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    // Update the admin's selected organization
    const admin = await Admin.findOneAndUpdate(
      { auth0Id: session.user.sub },
      { 
        $set: { 
          'preferences.selectedOrganizationId': organizationId 
        } 
      },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      selectedOrganizationId: organizationId 
    });
  } catch (error: any) {
    console.error('Error updating selected organization:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 