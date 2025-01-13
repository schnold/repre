import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { INotification } from '@/lib/db/schemas';

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    path: '/api/ws',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('join-organization', (organizationId: string) => {
      socket.join(`org:${organizationId}`);
    });

    socket.on('leave-organization', (organizationId: string) => {
      socket.leave(`org:${organizationId}`);
    });
  });

  return io;
}

export function getSocketIO() {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
}

export async function sendRealTimeNotifications(notifications: INotification[]) {
  if (!io) return;

  // Group notifications by user
  const notificationsByUser = notifications.reduce((acc, notification) => {
    const userId = notification.userId.toString();
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(notification);
    return acc;
  }, {} as Record<string, INotification[]>);

  // Send notifications to each user
  Object.entries(notificationsByUser).forEach(([userId, userNotifications]) => {
    io?.to(`user:${userId}`).emit('notifications', userNotifications);
  });
} 