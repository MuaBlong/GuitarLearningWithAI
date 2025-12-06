import { Home, BookOpen, Music, Video, BarChart3, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'home', label: 'Trang chủ', icon: Home, emoji: '🏠' },
  { id: 'theory', label: 'Lý thuyết', icon: BookOpen, emoji: '📖' },
  { id: 'practice', label: 'Luyện tập', icon: Music, emoji: '🎵' },
  { id: 'videos', label: 'Video bài học', icon: Video, emoji: '🎬' },
  { id: 'progress', label: 'Tiến độ', icon: BarChart3, emoji: '📊' },
  { id: 'forum', label: 'Diễn đàn', icon: MessageCircle, emoji: '💬' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="bg-gray-50 border-r border-gray-200 w-64 p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={`w-full justify-start space-x-3 ${
              activeTab === item.id 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="text-lg">{item.emoji}</span>
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>
    </aside>
  );
}