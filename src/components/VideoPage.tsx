import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, BookOpen, Clock, Users, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const videoLibrary = {
  basic: [
    {
      id: 1,
      title: "Cách cầm đàn Guitar đúng cách",
      description: "Học tư thế ngồi và cách cầm đàn guitar chuẩn từ cơ bản",
      instructor: "Thầy Minh Guitar",
      duration: "8:45",
      level: "Cơ bản",
      views: "15.2K",
      rating: 4.8,
      thumbnail: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBwb3NpdGlvbiUyMGhvbGRpbmd8ZW58MXx8fHwxNzU3NjE0MDA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "https://www.youtube.com/embed/F_KOPTZJcpM",
      chapters: [
        { time: "0:00", title: "Giới thiệu" },
        { time: "1:30", title: "Tư thế ngồi" },
        { time: "3:15", title: "Cách cầm cổ đàn" },
        { time: "5:45", title: "Vị trí tay phải" },
        { time: "7:20", title: "Thực hành" }
      ]
    },
    {
      id: 2,
      title: "Học hợp âm C - G - Am - F cơ bản",
      description: "4 hợp âm căn bản giúp bạn chơi được hàng ngàn bài hát",
      instructor: "Cô Lan Music",
      duration: "12:30",
      level: "Cơ bản",
      views: "23.7K",
      rating: 4.9,
      thumbnail: "https://images.unsplash.com/photo-1591680443128-5d3b1eb3b84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBjaG9yZHMlMjBmaW5nZXJpbmclMjBkaWFncmFtfGVufDF8fHx8MTc1NzYxMzk5OXww&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "https://www.youtube.com/embed/TocqCS4nzSc",
      chapters: [
        { time: "0:00", title: "Giới thiệu 4 hợp âm" },
        { time: "2:00", title: "Hợp âm C Major" },
        { time: "4:30", title: "Hợp âm G Major" },
        { time: "7:00", title: "Hợp âm A Minor" },
        { time: "9:15", title: "Hợp âm F Major" },
        { time: "11:00", title: "Chuyển đổi hợp âm" }
      ]
    },
    {
      id: 3,
      title: "Kỹ thuật gảy đàn cơ bản",
      description: "Học các kỹ thuật gảy đàn từ đơn giản đến phức tạp",
      instructor: "Anh Tuấn Guitar Pro",
      duration: "15:20",
      level: "Cơ bản",
      views: "18.9K",
      rating: 4.7,
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBzdHJ1bW1pbmclMjB0ZWNobmlxdWV8ZW58MXx8fHwxNzU3NjE0MDA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "https://www.youtube.com/embed/D9ioyEvdggk",
      chapters: [
        { time: "0:00", title: "Giới thiệu" },
        { time: "1:45", title: "Gảy xuống cơ bản" },
        { time: "4:30", title: "Gảy lên" },
        { time: "7:15", title: "Pattern gảy phổ biến" },
        { time: "10:00", title: "Fingerpicking cơ bản" },
        { time: "13:30", title: "Thực hành với bài hát" }
      ]
    }
  ],
  intermediate: [
    {
      id: 4,
      title: "Hợp âm Barre và kỹ thuật chuyển đổi",
      description: "Làm chủ hợp âm barre F và các hợp âm khó khác",
      instructor: "Thầy Nam Guitar Academy",
      duration: "18:45",
      level: "Trung cấp",
      views: "12.1K",
      rating: 4.6,
      thumbnail: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBiYXJyZSUyMGNob3JkfGVufDF8fHx8MTc1NzYxNDAwOXww&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "https://www.youtube.com/embed/BfCl8hOCA-Q",
      chapters: [
        { time: "0:00", title: "Tại sao barre quan trọng" },
        { time: "2:30", title: "Kỹ thuật barre cơ bản" },
        { time: "6:00", title: "Hợp âm F Major" },
        { time: "10:15", title: "Hợp âm Bm" },
        { time: "14:00", title: "Chuyển đổi mượt mà" },
        { time: "16:30", title: "Bài tập thực hành" }
      ]
    },
    {
      id: 5,
      title: "Blues và hợp âm 7th",
      description: "Khám phá thế giới blues với các hợp âm 7th",
      instructor: "Cô Hương Blues Guitar",
      duration: "22:10",
      level: "Trung cấp",
      views: "9.8K",
      rating: 4.8,
      thumbnail: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhibHVlcyUyMGd1aXRhciUyMGxlc3NvbnN8ZW58MXx8fHwxNzU3NjE0MDEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "https://www.youtube.com/embed/IP6DXXXzKGE",
      chapters: [
        { time: "0:00", title: "Giới thiệu Blues" },
        { time: "3:00", title: "12-bar Blues progression" },
        { time: "7:30", title: "Dominant 7th chords" },
        { time: "12:00", title: "Blues shuffle rhythm" },
        { time: "16:45", title: "Solo đơn giản" },
        { time: "20:00", title: "Jam session" }
      ]
    },
    {
      id: 6,
      title: "Fingerstyle Guitar nâng cao",
      description: "Kỹ thuật fingerstyle để chơi melody và bass cùng lúc",
      instructor: "Anh Phong Fingerstyle",
      duration: "25:30",
      level: "Trung cấp",
      views: "7.3K",
      rating: 4.9,
      thumbnail: "https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5nZXJzdHlsZSUyMGd1aXRhcnxlbnwxfHx8fDE3NTc2MTQwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "https://www.youtube.com/embed/78cjTfXLIwU",
      chapters: [
        { time: "0:00", title: "Chuẩn bị fingerstyle" },
        { time: "4:00", title: "Thumb và bass line" },
        { time: "8:30", title: "Fingers cho melody" },
        { time: "13:15", title: "Kết hợp bass và melody" },
        { time: "18:00", title: "Bài tập Travis picking" },
        { time: "22:00", title: "Canon in D fingerstyle" }
      ]
    }
  ],
  advanced: [
    {
      id: 7,
      title: "Jazz Guitar và hợp âm phức tạp",
      description: "Học jazz guitar với các hợp âm extended và alterations",
      instructor: "Thầy Hùng Jazz Master",
      duration: "28:15",
      level: "Nâng cao",
      views: "5.2K",
      rating: 4.7,
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwZ3VpdGFyJTIwbGVzc29uc3xlbnwxfHx8fDE3NTc2MTQwMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "https://www.youtube.com/embed/krDxhnaKD7Q",
      chapters: [
        { time: "0:00", title: "Jazz guitar introduction" },
        { time: "5:00", title: "Major 7th voicings" },
        { time: "10:30", title: "Minor 7th và dominant" },
        { time: "16:00", title: "Extended chords" },
        { time: "21:45", title: "ii-V-I progression" },
        { time: "26:00", title: "Jazz standard example" }
      ]
    },
    {
      id: 8,
      title: "Flamenco Guitar cơ bản",
      description: "Khám phá kỹ thuật flamenco và compas",
      instructor: "Señor Carlos Flamenco",
      duration: "20:40",
      level: "Nâng cao",
      views: "4.1K",
      rating: 4.8,
      thumbnail: "https://images.unsplash.com/photo-1520166012956-add9ba0835cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbGFtZW5jbyUyMGd1aXRhciUyMGxlc3NvbnN8ZW58MXx8fHwxNzU3NjE0MDE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "https://www.youtube.com/embed/jvipPYFebWc",
      chapters: [
        { time: "0:00", title: "Flamenco introduction" },
        { time: "3:30", title: "Rasgueado technique" },
        { time: "8:00", title: "Compas và rhythm" },
        { time: "12:15", title: "Basic falsetas" },
        { time: "16:30", title: "Phrygian mode" },
        { time: "18:45", title: "Simple piece" }
      ]
    }
  ]
};

export function VideoPage() {
  const [selectedVideo, setSelectedVideo] = useState(videoLibrary.basic[0]);
  const [currentCategory, setCurrentCategory] = useState('basic');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(2.5);
  const [selectedChapter, setSelectedChapter] = useState(0);

  const getCurrentVideos = () => {
    return videoLibrary[currentCategory as keyof typeof videoLibrary] || [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds);
    const secs = Math.floor((seconds - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">🎬</span>
        <h1 className="text-3xl font-bold text-gray-900">Video Học Guitar Toàn diện</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Library Sidebar */}
        <Card className="shadow-lg border-0 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span>Thư viện Video</span>
            </CardTitle>
            <CardDescription>Chọn video để học</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={currentCategory} onValueChange={setCurrentCategory}>
              <TabsList className="grid w-full grid-cols-1 gap-1">
                <TabsTrigger value="basic" className="text-xs">Cơ bản</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-1 gap-1 mt-1">
                <TabsTrigger value="intermediate" className="text-xs">Trung cấp</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-1 gap-1 mt-1">
                <TabsTrigger value="advanced" className="text-xs">Nâng cao</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getCurrentVideos().map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedVideo.id === video.id
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="relative mb-2">
                    <ImageWithFallback 
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-20 object-cover rounded"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{video.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{video.instructor}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">{video.level}</Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{video.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Video Player */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl">{selectedVideo.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedVideo.instructor}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{selectedVideo.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedVideo.rating}</span>
                  </div>
                </div>
              </CardTitle>
              <CardDescription>{selectedVideo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Player */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={selectedVideo.videoUrl}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
                
                {/* Custom Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-4">
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="flex items-center space-x-3">
                      <span className="text-white text-sm">{formatTime(currentTime)}</span>
                      <div className="flex-1">
                        <Progress value={(currentTime / 8.75) * 100} className="h-2" />
                      </div>
                      <span className="text-white text-sm">{selectedVideo.duration}</span>
                    </div>
                    
                    {/* Control Buttons */}
                    <div className="flex items-center space-x-4">
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={togglePlay}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => setIsMuted(!isMuted)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1"></div>
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chapters */}
                <div className="space-y-3">
                  <h3 className="font-medium">Chapters (Chương)</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedVideo.chapters.map((chapter, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedChapter(index)}
                        className={`p-3 rounded border cursor-pointer transition-all ${
                          selectedChapter === index
                            ? 'bg-indigo-50 border-indigo-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-indigo-600 font-mono">{chapter.time}</span>
                          <span className="text-sm">{chapter.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Stats & Actions */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{selectedVideo.views}</div>
                      <div className="text-xs text-gray-600">Lượt xem</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{selectedVideo.rating}/5</div>
                      <div className="text-xs text-gray-600">Đánh giá</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      ❤️ Yêu thích
                    </Button>
                    <Button variant="outline" className="w-full">
                      📋 Thêm vào playlist
                    </Button>
                    <Button variant="outline" className="w-full">
                      📝 Ghi chú
                    </Button>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">💡 Mẹo học hiệu quả:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Dừng video để thực hành từng phần</li>
                      <li>• Lặp lại các đoạn khó nhiều lần</li>
                      <li>• Ghi chú những điểm quan trọng</li>
                      <li>• Thực hành chậm trước khi tăng tốc</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Videos */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Video liên quan</CardTitle>
              <CardDescription>Các video khác bạn có thể thích</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentVideos().filter(v => v.id !== selectedVideo.id).slice(0, 3).map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="cursor-pointer group"
                  >
                    <div className="relative mb-2">
                      <ImageWithFallback 
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover rounded group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <h3 className="font-medium text-sm mb-1 group-hover:text-indigo-600 transition-colors">{video.title}</h3>
                    <p className="text-xs text-gray-600">{video.instructor}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">{video.level}</Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{video.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}