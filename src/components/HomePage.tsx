import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { BookOpen, Music, BarChart3, Users, Clock, Trophy, ArrowRight } from "lucide-react";

interface HomePageProps {
  currentUser?: {
    name: string;
  };
}

export function HomePage({ currentUser }: HomePageProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại, {currentUser?.name || 'bạn'}! 🎸</h1>
            <p className="text-indigo-100 text-lg">Sẵn sàng tiếp tục hành trình guitar của bạn chưa?</p>
          </div>
          <div className="text-6xl opacity-20">🎵</div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Luyện tập Hôm nay</span>
            </div>
            <p className="text-2xl font-bold mt-1">25 phút</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span className="text-sm">Chuỗi Hiện tại</span>
            </div>
            <p className="text-2xl font-bold mt-1">7 ngày</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5" />
              <span className="text-sm">Hợp âm Đã học</span>
            </div>
            <p className="text-2xl font-bold mt-1">12/20</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Tiếp tục Học</h3>
            <p className="text-sm text-gray-600 mt-1">Lý thuyết Module 2</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Music className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Buổi Luyện tập</h3>
            <p className="text-sm text-gray-600 mt-1">Chuyển đổi Hợp âm</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-medium text-gray-900">Xem Tiến độ</h3>
            <p className="text-sm text-gray-600 mt-1">Thống kê Tuần</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Cộng đồng</h3>
            <p className="text-sm text-gray-600 mt-1">Tham gia Thảo luận</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Lộ trình Học tập Hiện tại</CardTitle>
            <CardDescription>Tiến độ của bạn qua khóa học cơ bản</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hợp âm Cơ bản</span>
                <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
              </div>
              <Progress value={100} className="w-full" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chuyển đổi Hợp âm</span>
                <Badge className="bg-blue-100 text-blue-800">Đang học</Badge>
              </div>
              <Progress value={65} className="w-full" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nhịp điệu Gảy</span>
                <Badge variant="secondary">Khóa</Badge>
              </div>
              <Progress value={0} className="w-full" />
            </div>
            
            <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
              Tiếp tục Học
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Thử thách Hàng ngày</CardTitle>
            <CardDescription>Hoàn thành thử thách hôm nay để duy trì chuỗi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border-l-4 border-orange-500">
              <h3 className="font-medium text-orange-800 mb-2">🎯 Thử thách Hôm nay</h3>
              <p className="text-orange-700 text-sm">
                Chơi tiến hành hợp âm C → G → Am → F năm lần liên tiếp không dừng
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ</span>
                <span>3/5 lần hoàn thành</span>
              </div>
              <Progress value={60} className="w-full" />
            </div>
            
            <div className="flex space-x-2">
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                Bắt đầu Thử thách
              </Button>
              <Button variant="outline" className="flex-1">
                Bỏ qua Hôm nay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Hoạt động Gần đây</CardTitle>
          <CardDescription>Các buổi luyện tập và thành tích mới nhất của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-800">Thành tích Mở khóa!</p>
                <p className="text-sm text-green-600">Bạn đã thành thạo hợp âm C Major</p>
              </div>
              <span className="text-sm text-green-600">2 giờ trước</span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Music className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-800">Buổi Luyện tập</p>
                <p className="text-sm text-blue-600">30 phút luyện tập hợp âm</p>
              </div>
              <span className="text-sm text-blue-600">Hôm qua</span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-purple-800">Bài học Hoàn thành</p>
                <p className="text-sm text-purple-600">Lý thuyết Âm nhạc: Hiểu về Hợp âm</p>
              </div>
              <span className="text-sm text-purple-600">2 ngày trước</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}