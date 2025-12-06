import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { NotificationPanel } from "./NotificationPanel";
import { useNotifications } from "./NotificationContext";

interface NotificationButtonProps {
  onTabChange?: (tab: string) => void;
}

export function NotificationButton({ onTabChange }: NotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const { unreadCount } = useNotifications();
  const [previousUnreadCount, setPreviousUnreadCount] = useState(unreadCount);

  // Animate when new notification arrives
  useEffect(() => {
    if (unreadCount > previousUnreadCount) {
      setHasNewNotification(true);
      
      // Reset animation after 3 seconds
      setTimeout(() => {
        setHasNewNotification(false);
      }, 3000);
    }
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, previousUnreadCount]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePanel}
          className={`relative p-2 hover:bg-gray-100 transition-all duration-200 ${
            hasNewNotification ? 'animate-pulse' : ''
          }`}
        >
          <Bell 
            className={`h-5 w-5 transition-all duration-200 ${
              isOpen ? 'text-indigo-600' : 'text-gray-600'
            } ${hasNewNotification ? 'animate-bounce' : ''}`} 
          />
          
          {unreadCount > 0 && (
            <Badge 
              className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center transition-all duration-300 ${
                hasNewNotification ? 'animate-ping' : ''
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          
          {hasNewNotification && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
          )}
        </Button>
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {unreadCount > 0 ? `${unreadCount} thông báo mới` : 'Thông báo'}
            <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        )}
      </div>
      
      <NotificationPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        onTabChange={onTabChange}
      />
    </>
  );
}