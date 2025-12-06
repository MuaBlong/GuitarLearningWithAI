import { Bell, X, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { useNotifications } from "./NotificationContext";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange?: (tab: string) => void;
}

export function NotificationPanel({ isOpen, onClose, onTabChange }: NotificationPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    clearAllNotifications
  } = useNotifications();

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 'achievement':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'warning':
        return 'border-l-4 border-l-orange-500 bg-orange-50';
      case 'info':
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'achievement':
        return 'text-yellow-600';
      case 'warning':
        return 'text-orange-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return `${Math.floor(diffInDays / 7)} tuần trước`;
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionUrl && notification.actionUrl !== '#' && onTabChange) {
      const tab = notification.actionUrl.replace('/', '');
      onTabChange(tab);
      markAsRead(notification.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="absolute top-16 right-4 w-96 max-w-[calc(100vw-2rem)]">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-indigo-600" />
                <span>Thông báo</span>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllAsRead}
                    className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1"
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-1 p-4 pt-0">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Không có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer ${
                          getNotificationStyle(notification.type)
                        } ${!notification.read ? 'ring-2 ring-indigo-100' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full bg-white/80 ${getIconColor(notification.type)}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                              <div className="flex items-center space-x-2 ml-2">
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0" />
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearNotification(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTimestamp(notification.timestamp)}
                              </div>
                              
                              {notification.actionText && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification);
                                  }}
                                  className="text-xs px-3 py-1 h-auto bg-white/80 hover:bg-white border-gray-300"
                                >
                                  {notification.actionText}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            
            {notifications.length > 0 && (
              <div className="border-t bg-gray-50/80 p-3">
                <Button
                  variant="ghost"
                  className="w-full text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    clearAllNotifications();
                    onClose();
                  }}
                >
                  Xóa tất cả thông báo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}