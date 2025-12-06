import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { NotificationButton } from "./NotificationButton";

interface NavbarProps {
  currentUser?: {
    name: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onTabChange?: (tab: string) => void;
}

export function Navbar({ currentUser, onLogout, onTabChange }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎸</span>
          <h1 className="text-xl font-bold text-gray-900">Guitar Master</h1>
        </div>
        
        {currentUser && (
          <div className="flex items-center space-x-4">
            {/* Notification Button */}
            <NotificationButton onTabChange={onTabChange} />
            
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-indigo-500 text-white">
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}