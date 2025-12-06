import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Trophy, Clock, Target, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { progressAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

const practiceData = [
  { day: 'Mon', chords: 12, time: 25 },
  { day: 'Tue', chords: 18, time: 35 },
  { day: 'Wed', chords: 15, time: 30 },
  { day: 'Thu', chords: 22, time: 42 },
  { day: 'Fri', chords: 25, time: 45 },
  { day: 'Sat', chords: 30, time: 60 },
  { day: 'Sun', chords: 20, time: 38 },
];

const progressData = [
  { week: 'Week 1', accuracy: 45 },
  { week: 'Week 2', accuracy: 62 },
  { week: 'Week 3', accuracy: 78 },
  { week: 'Week 4', accuracy: 85 },
];

const achievements = [
  { id: 1, title: "First Chord", description: "Played your first C Major chord", badge: "🎯", unlocked: true },
  { id: 2, title: "Week Warrior", description: "Practiced 7 days in a row", badge: "🔥", unlocked: true },
  { id: 3, title: "Chord Master", description: "Mastered 10 different chords", badge: "🏆", unlocked: true },
  { id: 4, title: "Speed Demon", description: "Completed chord transitions under 2 seconds", badge: "⚡", unlocked: false },
  { id: 5, title: "Theory Expert", description: "Completed all theory lessons", badge: "🎓", unlocked: false },
  { id: 6, title: "100 Hour Club", description: "Practiced for 100 total hours", badge: "⏰", unlocked: false },
];

export function ProgressPage() {
  const [progressData, setProgressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      
      // Add timeout wrapper
      const progressPromise = progressAPI.getProgress();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout khi tải tiến trình')), 20000)
      );
      
      const data = await Promise.race([progressPromise, timeoutPromise]);
      setProgressData(data);
      console.log('✅ Progress data loaded successfully');
    } catch (error) {
      console.error("Error loading progress:", error);
      const errorMessage = (error as Error).message;
      
      // Fallback to mock data for demo
      const mockData = {
        profile: {
          name: 'Guitar Demo User',
          email: 'demo@guitar.com',
          level: 'Trung cấp',
          created_at: new Date().toISOString()
        },
        progress: {
          theory_progress: {
            'lesson-1': { completed: true, completedAt: new Date().toISOString() },
            'lesson-2': { completed: true, completedAt: new Date().toISOString() }
          },
          practice_progress: {
            'c-major': { completed: true, completedAt: new Date().toISOString(), practiceTime: 30 },
            'g-major': { completed: true, completedAt: new Date().toISOString(), practiceTime: 25 },
            'am-minor': { completed: true, completedAt: new Date().toISOString(), practiceTime: 35 }
          },
          video_progress: {
            'video-1': { completed: true, completedAt: new Date().toISOString() }
          },
          total_practice_time: 5400,
          achievements: ['first-chord', 'week-warrior']
        }
      };
      
      setProgressData(mockData);
      
      if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
        toast.warning("Server phản hồi chậm, hiển thị dữ liệu mẫu");
      } else {
        toast.error("Không thể kết nối server: " + errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Đang tải tiến trình học
            </h3>
            <p className="text-gray-600 mb-4">
              Đang lấy dữ liệu về thành tích và hoạt động của bạn...
            </p>
            
            <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700">
              📊 <strong>Đang xử lý:</strong> Thống kê luyện tập, thành tích, biểu đồ tiến độ
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="p-6 text-center">
        <p>Không thể tải tiến trình học. Vui lòng thử lại.</p>
      </div>
    );
  }

  const { profile, progress } = progressData;
  
  // Tính toán thống kê
  const theoryCompleted = Object.values(progress.theory_progress || {}).filter((p: any) => p.completed).length;
  const practiceCompleted = Object.values(progress.practice_progress || {}).filter((p: any) => p.completed).length;
  const videoCompleted = Object.values(progress.video_progress || {}).filter((p: any) => p.completed).length;
  const totalPracticeTime = Math.round((progress.total_practice_time || 0) / 60); // Convert to hours
  
  // Mock data for charts (in production, you'd calculate this from real data)
  const weeklyData = [
    { day: 'Mon', chords: practiceCompleted > 10 ? 12 : 8, time: 25 },
    { day: 'Tue', chords: practiceCompleted > 15 ? 18 : 12, time: 35 },
    { day: 'Wed', chords: practiceCompleted > 20 ? 15 : 10, time: 30 },
    { day: 'Thu', chords: practiceCompleted > 25 ? 22 : 15, time: 42 },
    { day: 'Fri', chords: practiceCompleted > 30 ? 25 : 18, time: 45 },
    { day: 'Sat', chords: practiceCompleted > 35 ? 30 : 20, time: 60 },
    { day: 'Sun', chords: practiceCompleted > 40 ? 20 : 15, time: 38 },
  ];

  const accuracyData = [
    { week: 'Week 1', accuracy: 45 },
    { week: 'Week 2', accuracy: 62 },
    { week: 'Week 3', accuracy: Math.min(78, 50 + practiceCompleted) },
    { week: 'Week 4', accuracy: Math.min(90, 60 + practiceCompleted) },
  ];

  // Dynamic achievements based on progress
  const achievements = [
    { 
      id: 1, 
      title: "Hợp âm đầu tiên", 
      description: "Hoàn thành hợp âm C Major đầu tiên", 
      badge: "🎯", 
      unlocked: practiceCompleted > 0 
    },
    { 
      id: 2, 
      title: "Chiến binh tuần", 
      description: "Luyện tập 7 ngày liên tiếp", 
      badge: "🔥", 
      unlocked: totalPracticeTime > 5 
    },
    { 
      id: 3, 
      title: "Thầy hợp âm", 
      description: "Thành thạo 10 hợp âm khác nhau", 
      badge: "🏆", 
      unlocked: practiceCompleted >= 10 
    },
    { 
      id: 4, 
      title: "Tốc độ ánh sáng", 
      description: "Chuyển đổi hợp âm dưới 2 giây", 
      badge: "⚡", 
      unlocked: practiceCompleted >= 20 
    },
    { 
      id: 5, 
      title: "Chuyên gia lý thuyết", 
      description: "Hoàn thành tất cả bài học lý thuyết", 
      badge: "🎓", 
      unlocked: theoryCompleted >= 10 
    },
    { 
      id: 6, 
      title: "Câu lạc bộ 100 giờ", 
      description: "Luyện tập tổng cộng 100 giờ", 
      badge: "⏰", 
      unlocked: totalPracticeTime >= 100 
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">📊</span>
        <h1 className="text-3xl font-bold text-gray-900">Tiến độ Học tập của Bạn</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalPracticeTime}h</p>
                <p className="text-sm text-gray-600">Tổng Thời gian Luyện tập</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{practiceCompleted}</p>
                <p className="text-sm text-gray-600">Hợp âm Đã thành thạo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.min(90, 60 + practiceCompleted)}%</p>
                <p className="text-sm text-gray-600">Tỷ lệ Chính xác</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{unlockedAchievements}</p>
                <p className="text-sm text-gray-600">Thành tích</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Hoạt động Luyện tập Hàng tuần</CardTitle>
            <CardDescription>Hợp âm đã luyện và thời gian dành ra tuần này</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="chords" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Cải thiện Độ chính xác</CardTitle>
            <CardDescription>Độ chính xác hợp âm của bạn theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span>Achievements</span>
          </CardTitle>
          <CardDescription>Unlock badges as you progress in your guitar journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.badge}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${
                      achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    <Badge 
                      variant={achievement.unlocked ? "default" : "secondary"}
                      className="mt-2"
                    >
                      {achievement.unlocked ? "Đã mở khóa" : "Chưa mở khóa"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Goals */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Current Goals</CardTitle>
          <CardDescription>Track your progress toward your learning objectives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Master F Major Chord</span>
              <span className="text-sm text-gray-600">3/5 days</span>
            </div>
            <Progress value={60} className="w-full" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Practice 30 min daily</span>
              <span className="text-sm text-gray-600">5/7 days</span>
            </div>
            <Progress value={71} className="w-full" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Complete Theory Module 2</span>
              <span className="text-sm text-gray-600">7/10 lessons</span>
            </div>
            <Progress value={70} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}