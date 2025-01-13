import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { INotification } from '@/lib/db/schemas';
import { useToast } from '@/components/ui/use-toast';

export function useNotifications() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();

    // Listen for real-time notifications
    if (socket) {
      socket.on('notifications', (newNotifications: INotification[]) => {
        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);
        
        // Show toast for new notifications
        newNotifications.forEach(notification => {
          toast({
            title: notification.title,
            children: notification.message,
            duration: 5000
          });
        });
      });
    }

    return () => {
      socket?.off('notifications');
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?status=unread');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      setNotifications(prev => 
        prev.map(n => ({
          ...n,
          status: n._id === notificationId ? 'read' : n.status,
          readAt: n._id === notificationId ? new Date() : n.readAt
        } as INotification))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      
      setNotifications(prev => 
        prev.map(n => ({
          ...n,
          status: 'read',
          readAt: new Date()
        } as INotification))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
} 