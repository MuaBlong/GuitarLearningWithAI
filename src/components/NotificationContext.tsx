import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { Music, BookOpen, Video, Trophy, Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'achievement';
  timestamp: Date;
  read: boolean;
  icon: any;
  actionText?: string;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Hoàn thành bài học mới!',
      message: 'Bạn đã hoàn thành bài "Hợp âm Trưởng (Major)". Tiếp tục với bài học tiếp theo nhé!',
      type: 'success',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
      icon: BookOpen,
      actionText: 'Xem bài tiếp theo',
      actionUrl: '/theory'
    },
    {
      id: '2',
      title: 'Video mới đã được thêm!',
      message: 'Video "Kỹ thuật fingerstyle nâng cao" vừa được cập nhật. Hãy xem ngay!',
      type: 'info',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      icon: Video,
      actionText: 'Xem video',
      actionUrl: '/videos'
    },
    {
      id: '3',
      title: 'Thành tích mới mở khóa!',
      message: 'Chúc mừng! Bạn đã mở khóa thành tích "Guitar Newbie" sau khi hoàn thành 5 bài học.',
      type: 'achievement',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      icon: Trophy,
      actionText: 'Xem thành tích',
      actionUrl: '/progress'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    toast.success(notificationData.title, {
      description: notificationData.message,
      duration: 4000,
      action: notificationData.actionText ? {
        label: notificationData.actionText,
        onClick: () => {
          // Handle action click
          console.log('Notification action clicked:', notificationData.actionUrl);
        }
      } : undefined
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulate push notifications
  useEffect(() => {
    const pushNotifications = [
      {
        title: 'Lời nhắc luyện tập hàng ngày',
        message: 'Đã đến giờ luyện tập guitar! Hãy dành 15 phút để thực hành nhé.',
        type: 'warning' as const,
        icon: Music,
        actionText: 'Bắt đầu luyện tập',
        actionUrl: '/practice'
      },
      {
        title: 'Bài học mới có sẵn!',
        message: 'Bài học "Modes và Thang âm Nâng cao" vừa được cập nhật.',
        type: 'info' as const,
        icon: BookOpen,
        actionText: 'Học ngay',
        actionUrl: '/theory'
      },
      {
        title: 'Streak 7 ngày!',
        message: 'Tuyệt vời! Bạn đã học liên tục 7 ngày. Hãy tiếp tục phát huy!',
        type: 'achievement' as const,
        icon: Trophy,
        actionText: 'Xem thành tích',
        actionUrl: '/progress'
      },
      {
        title: 'Video tuần này',
        message: 'Khám phá video "Jazz Guitar cơ bản" - hoàn hảo cho cuối tuần!',
        type: 'info' as const,
        icon: Video,
        actionText: 'Xem ngay',
        actionUrl: '/videos'
      }
    ];

    let notificationIndex = 0;

    const interval = setInterval(() => {
      if (notificationIndex < pushNotifications.length) {
        // Random chance to show notification (30% every 45 seconds)
        if (Math.random() < 0.3) {
          addNotification(pushNotifications[notificationIndex]);
          notificationIndex++;
        }
      } else {
        // Reset cycle after all notifications are shown
        notificationIndex = 0;
      }
    }, 45000); // Check every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    unreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}