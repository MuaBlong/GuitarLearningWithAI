import { useNotifications } from './NotificationContext';
import { BookOpen, Music, Video, Trophy, Clock } from 'lucide-react';

export function useNotificationTriggers() {
  const { addNotification } = useNotifications();

  const triggerLessonComplete = (lessonTitle: string) => {
    addNotification({
      title: 'Bài học hoàn thành! 🎉',
      message: `Tuyệt vời! Bạn đã hoàn thành bài "${lessonTitle}". Hãy tiếp tục với bài tiếp theo!`,
      type: 'success',
      icon: BookOpen,
      actionText: 'Bài tiếp theo',
      actionUrl: '/theory'
    });
  };

  const triggerChordMastered = (chordName: string) => {
    addNotification({
      title: 'Hợp âm thành thạo! 🎸',
      message: `Chúc mừng! Bạn đã thành thạo hợp âm ${chordName}. Độ chính xác 95%+`,
      type: 'success',
      icon: Music,
      actionText: 'Hợp âm khác',
      actionUrl: '/practice'
    });
  };

  const triggerVideoCompleted = (videoTitle: string) => {
    addNotification({
      title: 'Video đã xem xong! 📹',
      message: `Bạn đã hoàn thành video "${videoTitle}". Hãy thực hành những gì vừa học!`,
      type: 'info',
      icon: Video,
      actionText: 'Luyện tập',
      actionUrl: '/practice'
    });
  };

  const triggerAchievementUnlocked = (achievementName: string, description: string) => {
    addNotification({
      title: 'Thành tích mới! 🏆',
      message: `Bạn đã mở khóa thành tích "${achievementName}": ${description}`,
      type: 'achievement',
      icon: Trophy,
      actionText: 'Xem thành tích',
      actionUrl: '/progress'
    });
  };

  const triggerPracticeReminder = () => {
    addNotification({
      title: 'Đến giờ luyện tập! ⏰',
      message: 'Bạn chưa luyện tập hôm nay. Hãy dành 15 phút để duy trì tiến độ nhé!',
      type: 'warning',
      icon: Clock,
      actionText: 'Luyện tập ngay',
      actionUrl: '/practice'
    });
  };

  const triggerStreakMilestone = (days: number) => {
    addNotification({
      title: `Streak ${days} ngày! 🔥`,
      message: `Tuyệt vời! Bạn đã học liên tục ${days} ngày. Hãy tiếp tục phát huy!`,
      type: 'achievement',
      icon: Trophy,
      actionText: 'Xem tiến độ',
      actionUrl: '/progress'
    });
  };

  const triggerNewContent = (contentType: string, title: string) => {
    addNotification({
      title: 'Nội dung mới! ✨',
      message: `${contentType} mới "${title}" vừa được thêm vào. Hãy khám phá ngay!`,
      type: 'info',
      icon: contentType === 'Video' ? Video : BookOpen,
      actionText: 'Xem ngay',
      actionUrl: contentType === 'Video' ? '/videos' : '/theory'
    });
  };

  return {
    triggerLessonComplete,
    triggerChordMastered,
    triggerVideoCompleted,
    triggerAchievementUnlocked,
    triggerPracticeReminder,
    triggerStreakMilestone,
    triggerNewContent
  };
}