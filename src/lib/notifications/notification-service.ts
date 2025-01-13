import { Notification, Organization, User } from '@/lib/db/schemas';
import { sendEmail } from '@/lib/email/email-service';
import { sendPushNotification } from '@/lib/push/push-service';

interface NotificationPayload {
  organizationId: string;
  type: 'event_change' | 'schedule_update' | 'substitution_request' | 'system';
  title: string;
  message: string;
  relatedTo?: {
    type: 'event' | 'schedule' | 'organization';
    id: string;
  };
  recipients: string[];
}

export async function createNotification(payload: NotificationPayload) {
  const organization = await Organization.findById(payload.organizationId);
  if (!organization) throw new Error('Organization not found');

  // Get recipient users with their preferences
  const users = await User.find({
    _id: { $in: payload.recipients }
  });

  const notifications = await Promise.all(
    users.map(async (user) => {
      const notification = new Notification({
        userId: user._id,
        organizationId: payload.organizationId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        relatedTo: payload.relatedTo,
        status: 'unread',
        createdAt: new Date()
      });

      await notification.save();

      // Check user preferences and send notifications accordingly
      if (user.preferences.notifications.email) {
        await sendEmail({
          to: user.email,
          subject: payload.title,
          text: payload.message,
          // Add more email template data as needed
        });
      }

      if (user.preferences.notifications.push) {
        await sendPushNotification({
          userId: user._id.toString(),
          title: payload.title,
          body: payload.message,
          data: {
            type: payload.type,
            relatedTo: payload.relatedTo
          }
        });
      }

      return notification;
    })
  );

  return notifications;
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string
) {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      userId,
      status: 'unread'
    },
    {
      $set: {
        status: 'read',
        readAt: new Date()
      }
    },
    { new: true }
  );

  return notification;
}

export async function markAllNotificationsAsRead(userId: string) {
  const result = await Notification.updateMany(
    {
      userId,
      status: 'unread'
    },
    {
      $set: {
        status: 'read',
        readAt: new Date()
      }
    }
  );

  return result.modifiedCount;
} 