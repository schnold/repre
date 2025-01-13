import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/api-handler';
import { Notification, Organization } from '@/lib/db/schemas';
import { sendRealTimeNotifications } from '@/lib/websocket/websocket-service';
import { z } from 'zod';

const notificationSchema = z.object({
  organizationId: z.string(),
  type: z.enum(['event_change', 'schedule_update', 'substitution_request', 'system']),
  title: z.string(),
  message: z.string(),
  relatedTo: z.object({
    type: z.enum(['event', 'schedule', 'organization']),
    id: z.string()
  }).optional(),
  recipients: z.array(z.string()) // User IDs
});

export async function GET(req: Request) {
  return withAuth(async (session) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'unread';
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Get user's organizations
    const organizations = await Organization.find({
      members: session.user.id
    }).select('_id');

    const notifications = await Notification.find({
      userId: session.user.id,
      organizationId: { $in: organizations.map(org => org._id) },
      status
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({
      userId: session.user.id,
      status
    });

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        limit,
        skip
      }
    });
  });
}

export async function POST(req: Request) {
  return withAuth(async (session) => {
    const data = await req.json();
    
    try {
      const validatedData = notificationSchema.parse(data);
      
      // Check if user has permission to send notifications
      const organization = await Organization.findOne({
        _id: validatedData.organizationId,
        admins: session.user.id
      });

      if (!organization) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // Create notifications for all recipients
      const notifications = await Promise.all(
        validatedData.recipients.map(userId =>
          new Notification({
            ...validatedData,
            userId,
            status: 'unread',
            createdAt: new Date()
          }).save()
        )
      );

      // Trigger real-time notifications if configured
      await sendRealTimeNotifications(notifications);

      return NextResponse.json(notifications);
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