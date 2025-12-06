import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Play, BookOpen, Volume2, ChevronRight, Clock, Music, FileMusic, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNotificationTriggers } from "./NotificationTriggers";

const theoryLessons = [
  {
    id: 1,
    title: "Nốt nhạc và Ký hiệu",
    description: "Học về 7 nốt nhạc cơ bản và cách đọc ký hiệu",
    progress: 100,
    completed: true,
    duration: "15 phút",
    category: "basic"
  },
  {
    id: 2,
    title: "Quãng âm và Khoảng cách",
    description: "Hiểu về khoảng cách giữa các nốt nhạc",
    progress: 85,
    completed: false,
    duration: "20 phút",
    category: "basic"
  },
  {
    id: 3,
    title: "Âm giai Trưởng và Thứ",
    description: "Tìm hiểu cấu trúc các âm giai cơ bản",
    progress: 60,
    completed: false,
    duration: "25 phút",
    category: "basic"
  },
  {
    id: 4,
    title: "Vòng tròn Quint",
    description: "Khám phá mối quan hệ giữa các tonality",
    progress: 40,
    completed: false,
    duration: "30 phút",
    category: "basic"
  },
  {
    id: 5,
    title: "Hiểu về Hợp âm",
    description: "Học cơ bản về cấu tạo hợp âm",
    progress: 100,
    completed: true,
    duration: "15 phút",
    category: "chords"
  },
  {
    id: 6,
    title: "Hợp âm Trưởng (Major)",
    description: "Tìm hiểu về hợp âm trưởng và cách chơi",
    progress: 75,
    completed: false,
    duration: "20 phút",
    category: "chords"
  },
  {
    id: 7,
    title: "Hợp âm Thứ (Minor)",
    description: "Khám phá âm thanh buồn của hợp âm thứ",
    progress: 45,
    completed: false,
    duration: "18 phút",
    category: "chords"
  },
  {
    id: 8,
    title: "Hợp âm Bảy (7th Chords)",
    description: "Nâng cao với hợp âm bảy",
    progress: 20,
    completed: false,
    duration: "25 phút",
    category: "chords"
  },
  {
    id: 9,
    title: "Tiến hành Hợp âm",
    description: "Cách kết nối các hợp âm",
    progress: 0,
    completed: false,
    duration: "30 phút",
    category: "advanced"
  },
  {
    id: 10,
    title: "Modes và Thang âm Nâng cao",
    description: "Khám phá các modes và thang âm phức tạp",
    progress: 0,
    completed: false,
    duration: "35 phút",
    category: "advanced"
  }
];

export function TheoryPage() {
  const [selectedLesson, setSelectedLesson] = useState(theoryLessons[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { triggerLessonComplete, triggerAchievementUnlocked } = useNotificationTriggers();

  const filteredLessons = selectedCategory === 'all' 
    ? theoryLessons 
    : theoryLessons.filter(lesson => lesson.category === selectedCategory);

  const handleCompleteLesson = (lesson: any) => {
    // Update lesson progress to completed
    lesson.progress = 100;
    lesson.completed = true;
    
    // Trigger notification
    triggerLessonComplete(lesson.title);
    
    // Check for achievements
    const completedLessons = theoryLessons.filter(l => l.completed).length;
    if (completedLessons === 5) {
      triggerAchievementUnlocked('Theory Master', 'Hoàn thành 5 bài học lý thuyết');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">📖</span>
        <h1 className="text-3xl font-bold text-gray-900">Lý thuyết Âm nhạc Toàn diện</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson List */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Danh sách Bài học</CardTitle>
            <CardDescription>Chọn bài học để bắt đầu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Filter */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all" className="text-xs">Tất cả</TabsTrigger>
                <TabsTrigger value="basic" className="text-xs">Cơ bản</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-2 mt-2">
                <TabsTrigger value="chords" className="text-xs">Hợp âm</TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs">Nâng cao</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="space-y-3">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedLesson.id === lesson.id
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{lesson.title}</h3>
                    {lesson.completed && (
                      <Badge className="bg-green-100 text-green-800 text-xs">Hoàn thành</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{lesson.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {lesson.duration}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <Progress value={lesson.progress} className="w-full mt-2 h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lesson Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <span>{selectedLesson.title}</span>
              </CardTitle>
              <CardDescription>{selectedLesson.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedLesson.id === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <ImageWithFallback 
                      src="https://images.unsplash.com/photo-1649562211721-60f2a884bba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpY2FsJTIwbm90ZXMlMjBzdGFmZiUyMHRyZWJsZSUyMGNsZWZ8ZW58MXx8fHwxNzU3NjEzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Nốt nhạc trên khuông nhạc"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-3">7 Nốt nhạc Cơ bản</h3>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Do (C)', 'Re (D)', 'Mi (E)', 'Fa (F)', 'Sol (G)', 'La (A)', 'Si (B)'].map((note, idx) => (
                      <div key={idx} className="bg-gradient-to-b from-white to-gray-100 p-3 rounded-lg border text-center">
                        <div className="text-lg font-bold text-indigo-600">{note.split(' ')[0]}</div>
                        <div className="text-xs text-gray-600">{note.split(' ')[1]}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Âm nhạc được xây dựng từ 7 nốt nhạc cơ bản: Do, Re, Mi, Fa, Sol, La, Si (C, D, E, F, G, A, B). 
                    Các nốt này lặp lại theo chu kỳ và tạo thành nền tảng cho mọi giai điệu và hợp âm.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Tần số và Cao độ</h4>
                    <p className="text-sm text-gray-700">
                      Mỗi nốt nhạc có tần số riêng. Ví dụ: A4 (La giữa) = 440Hz. 
                      Khi tăng lên một quãng 8 (octave), tần số gấp đôi.
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
                    <p className="text-indigo-800 font-medium">💡 Mẹo học:</p>
                    <p className="text-indigo-700 text-sm mt-1">
                      Hát theo thang âm Do-Re-Mi để ghi nhớ âm thanh của từng nốt nhạc!
                    </p>
                  </div>
                </div>
              )}

              {selectedLesson.id === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-3">Quãng âm và Khoảng cách</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Quãng âm là khoảng cách giữa hai nốt nhạc. Hiểu về quãng âm giúp bạn xây dựng hợp âm và giai điệu một cách chính xác.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Các Quãng Cơ bản</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Quãng 1 (Unison)</span><span>0 bán cung</span></div>
                        <div className="flex justify-between"><span>Quãng 2 thứ</span><span>1 bán cung</span></div>
                        <div className="flex justify-between"><span>Quãng 2 trưởng</span><span>2 bán cung</span></div>
                        <div className="flex justify-between"><span>Quãng 3 thứ</span><span>3 bán cung</span></div>
                        <div className="flex justify-between"><span>Quãng 3 trưởng</span><span>4 bán cung</span></div>
                        <div className="flex justify-between"><span>Quãng 4 hoàn hảo</span><span>5 bán cung</span></div>
                        <div className="flex justify-between"><span>Quãng 5 hoàn hảo</span><span>7 bán cung</span></div>
                        <div className="flex justify-between"><span>Quãng 8 (Octave)</span><span>12 bán cung</span></div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Ví dụ từ nốt C</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>C → C</span><span>Quãng 1</span></div>
                        <div className="flex justify-between"><span>C → D</span><span>Quãng 2 trưởng</span></div>
                        <div className="flex justify-between"><span>C → E</span><span>Quãng 3 trưởng</span></div>
                        <div className="flex justify-between"><span>C → F</span><span>Quãng 4 hoàn hảo</span></div>
                        <div className="flex justify-between"><span>C → G</span><span>Quãng 5 hoàn hảo</span></div>
                        <div className="flex justify-between"><span>C → A</span><span>Quãng 6 trưởng</span></div>
                        <div className="flex justify-between"><span>C → B</span><span>Quãng 7 trưởng</span></div>
                        <div className="flex justify-between"><span>C → C</span><span>Quãng 8</span></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
                    <p className="text-indigo-800 font-medium">🎼 Luyện tập:</p>
                    <p className="text-indigo-700 text-sm mt-1">
                      Hãy thử chơi các quãng khác nhau trên guitar và nghe sự khác biệt về âm thanh!
                    </p>
                  </div>
                </div>
              )}

              {selectedLesson.id === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-3">Âm giai Trưởng và Thứ</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Âm giai là chuỗi các nốt nhạc được sắp xếp theo một thứ tự nhất định. 
                    Âm giai trưởng và thứ là hai loại âm giai cơ bản nhất trong âm nhạc phương Tây.
                  </p>
                  
                  <Tabs defaultValue="major-scale" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="major-scale">Âm giai Trưởng</TabsTrigger>
                      <TabsTrigger value="minor-scale">Âm giai Thứ</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="major-scale" className="space-y-4">
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Cấu trúc Âm giai Trưởng</h4>
                        <p className="text-sm text-gray-700 mb-3">Công thức: Toàn - Toàn - Nửa - Toàn - Toàn - Toàn - Nửa</p>
                        <div className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-7 gap-2 text-center text-sm">
                            <div><strong>Do</strong><br/>C</div>
                            <div><strong>Re</strong><br/>D</div>
                            <div><strong>Mi</strong><br/>E</div>
                            <div><strong>Fa</strong><br/>F</div>
                            <div><strong>Sol</strong><br/>G</div>
                            <div><strong>La</strong><br/>A</div>
                            <div><strong>Si</strong><br/>B</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Âm giai C Major trên Guitar</h4>
                        <div className="font-mono text-xs bg-white p-3 rounded border">
                          <div>E |---0---2---3---</div>
                          <div>B |---1---3-------</div>
                          <div>G |---0---2-------</div>
                          <div>D |---0---2---3---</div>
                          <div>A |---0---2---3---</div>
                          <div>E |---0---2---3---</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="minor-scale" className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Cấu trúc Âm giai Thứ Tự nhiên</h4>
                        <p className="text-sm text-gray-700 mb-3">Công thức: Toàn - Nửa - Toàn - Toàn - Nửa - Toàn - Toàn</p>
                        <div className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-7 gap-2 text-center text-sm">
                            <div><strong>La</strong><br/>A</div>
                            <div><strong>Si</strong><br/>B</div>
                            <div><strong>Do</strong><br/>C</div>
                            <div><strong>Re</strong><br/>D</div>
                            <div><strong>Mi</strong><br/>E</div>
                            <div><strong>Fa</strong><br/>F</div>
                            <div><strong>Sol</strong><br/>G</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">So sánh Cảm xúc</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-yellow-700">Âm giai Trưởng:</p>
                            <p>Vui vẻ, tươi sáng, lạc quan</p>
                          </div>
                          <div>
                            <p className="font-medium text-purple-700">Âm giai Thứ:</p>
                            <p>Buồn bã, u sầu, sâu lắng</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {selectedLesson.id === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <ImageWithFallback 
                      src="https://images.unsplash.com/photo-1729335511883-29eade10006b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHRoZW9yeSUyMGNpcmNsZSUyMG9mJTIwZmlmdGhzfGVufDF8fHx8MTc1NzYxNDAwMnww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Vòng tròn quint"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-3">Vòng tròn Quint (Circle of Fifths)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Vòng tròn quint là một công cụ quan trọng giúp hiểu mối quan hệ giữa các tonality và số dấu trong các thang âm.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Thứ tự theo chiều kim đồng hồ (#)</h4>
                      <div className="space-y-1 text-sm">
                        <div>C (0 dấu #)</div>
                        <div>G (1 dấu #: F#)</div>
                        <div>D (2 dấu #: F#, C#)</div>
                        <div>A (3 dấu #: F#, C#, G#)</div>
                        <div>E (4 dấu #: F#, C#, G#, D#)</div>
                        <div>B (5 dấu #: F#, C#, G#, D#, A#)</div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Thứ tự ngược chiều kim đồng hồ (♭)</h4>
                      <div className="space-y-1 text-sm">
                        <div>C (0 dấu ♭)</div>
                        <div>F (1 dấu ♭: B♭)</div>
                        <div>B♭ (2 dấu ♭: B♭, E♭)</div>
                        <div>E♭ (3 dấu ♭: B♭, E♭, A♭)</div>
                        <div>A♭ (4 dấu ♭: B♭, E♭, A♭, D♭)</div>
                        <div>D♭ (5 dấu ♭: B♭, E♭, A♭, D♭, G♭)</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Ứng dụng thực tế</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Xác định tonality của bài hát</li>
                      <li>• Tìm các hợp âm liên quan</li>
                      <li>• Chuyển tonality (transpose)</li>
                      <li>• Hiểu progression hợp âm phổ biến</li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedLesson.id === 5 && (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Hợp âm là sự kết hợp của ba hay nhiều nốt nhạc khác nhau được chơi cùng lúc. 
                    Hợp âm cơ bản nhất là hợp âm tam (triad), bao gồm ba nốt: căn bản (root), tam (third), và quint (fifth).
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Hợp âm trưởng có âm thanh tươi sáng, vui tươi, trong khi hợp âm thứ thường có âm thanh buồn bã hoặc u sầu. 
                    Hiểu được sự khác biệt này rất quan trọng để thể hiện cảm xúc trong việc chơi đàn.
                  </p>
                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
                    <p className="text-indigo-800 font-medium">💡 Mẹo hay:</p>
                    <p className="text-indigo-700 text-sm mt-1">
                      Bắt đầu với các hợp âm mở như C, G, Am, và F. Đây là nền tảng của vô số bài hát!
                    </p>
                  </div>
                </div>
              )}

              {selectedLesson.id === 10 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-3">Modes và Thang âm Nâng cao</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Modes là các biến thể của thang âm trưởng, mỗi mode có character và màu sắc âm thanh riêng biệt.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">7 Modes của thang âm C Major</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Ionian (C):</strong> C-D-E-F-G-A-B</div>
                        <div><strong>Dorian (D):</strong> D-E-F-G-A-B-C</div>
                        <div><strong>Phrygian (E):</strong> E-F-G-A-B-C-D</div>
                        <div><strong>Lydian (F):</strong> F-G-A-B-C-D-E</div>
                        <div><strong>Mixolydian (G):</strong> G-A-B-C-D-E-F</div>
                        <div><strong>Aeolian (A):</strong> A-B-C-D-E-F-G</div>
                        <div><strong>Locrian (B):</strong> B-C-D-E-F-G-A</div>
                      </div>
                    </div>
                    
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Character của từng Mode</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Ionian:</strong> Tươi sáng, cổ điển</div>
                        <div><strong>Dorian:</strong> Hơi buồn nhưng hy vọng</div>
                        <div><strong>Phrygian:</strong> Tối tăm, Spanish</div>
                        <div><strong>Lydian:</strong> Mơ mộng, kỳ ảo</div>
                        <div><strong>Mixolydian:</strong> Blues, rock</div>
                        <div><strong>Aeolian:</strong> Buồn bã, tự nhiên</div>
                        <div><strong>Locrian:</strong> Không ổn định</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedLesson.id === 2 && (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Hợp âm trưởng được tạo thành từ nốt căn bản, tam trưởng, và quint hoàn hảo. 
                    Công thức khoảng cách: Căn bản + 4 bán cung + 3 bán cung.
                  </p>
                  
                  <Tabs defaultValue="c-major" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="c-major">C Major</TabsTrigger>
                      <TabsTrigger value="g-major">G Major</TabsTrigger>
                      <TabsTrigger value="d-major">D Major</TabsTrigger>
                      <TabsTrigger value="a-major">A Major</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="c-major" className="space-y-3">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">C Major (Do Trưởng)</h4>
                        <p className="text-sm text-gray-600 mb-2">Nốt: C - E - G</p>
                        <div className="font-mono text-sm bg-white p-3 rounded border">
                          <div>E |---0---</div>
                          <div>B |---1---</div>
                          <div>G |---0---</div>
                          <div>D |---2---</div>
                          <div>A |---3---</div>
                          <div>E |-------</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="g-major" className="space-y-3">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">G Major (Sol Trưởng)</h4>
                        <p className="text-sm text-gray-600 mb-2">Nốt: G - B - D</p>
                        <div className="font-mono text-sm bg-white p-3 rounded border">
                          <div>E |---3---</div>
                          <div>B |---0---</div>
                          <div>G |---0---</div>
                          <div>D |---0---</div>
                          <div>A |---2---</div>
                          <div>E |---3---</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="d-major" className="space-y-3">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">D Major (Re Trưởng)</h4>
                        <p className="text-sm text-gray-600 mb-2">Nốt: D - F# - A</p>
                        <div className="font-mono text-sm bg-white p-3 rounded border">
                          <div>E |---2---</div>
                          <div>B |---3---</div>
                          <div>G |---2---</div>
                          <div>D |---0---</div>
                          <div>A |-------</div>
                          <div>E |-------</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="a-major" className="space-y-3">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">A Major (La Trưởng)</h4>
                        <p className="text-sm text-gray-600 mb-2">Nốt: A - C# - E</p>
                        <div className="font-mono text-sm bg-white p-3 rounded border">
                          <div>E |---0---</div>
                          <div>B |---2---</div>
                          <div>G |---2---</div>
                          <div>D |---2---</div>
                          <div>A |---0---</div>
                          <div>E |-------</div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {selectedLesson.id === 3 && (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Hợp âm thứ có âm thanh buồn bã và được tạo thành từ nốt căn bản, tam thứ, và quint hoàn hảo. 
                    Công thức: Căn bản + 3 bán cung + 4 bán cung.
                  </p>
                  
                  <Tabs defaultValue="am-minor" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="am-minor">Am</TabsTrigger>
                      <TabsTrigger value="em-minor">Em</TabsTrigger>
                      <TabsTrigger value="dm-minor">Dm</TabsTrigger>
                      <TabsTrigger value="fm-minor">Fm</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="am-minor" className="space-y-3">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">A Minor (La Thứ)</h4>
                        <p className="text-sm text-gray-600 mb-2">Nốt: A - C - E</p>
                        <div className="font-mono text-sm bg-white p-3 rounded border">
                          <div>E |---0---</div>
                          <div>B |---1---</div>
                          <div>G |---2---</div>
                          <div>D |---2---</div>
                          <div>A |---0---</div>
                          <div>E |-------</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="em-minor" className="space-y-3">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">E Minor (Mi Thứ)</h4>
                        <p className="text-sm text-gray-600 mb-2">Nốt: E - G - B</p>
                        <div className="font-mono text-sm bg-white p-3 rounded border">
                          <div>E |---0---</div>
                          <div>B |---0---</div>
                          <div>G |---0---</div>
                          <div>D |---2---</div>
                          <div>A |---2---</div>
                          <div>E |---0---</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="dm-minor" className="space-y-3">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">D Minor (Re Thứ)</h4>
                        <p className="text-sm text-gray-600 mb-2">Nốt: D - F - A</p>
                        <div className="font-mono text-sm bg-white p-3 rounded border">
                          <div>E |---1---</div>
                          <div>B |---3---</div>
                          <div>G |---2---</div>
                          <div>D |---0---</div>
                          <div>A |-------</div>
                          <div>E |-------</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="fm-minor" className="space-y-3">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">F Minor (Fa Thứ)</h4>
                        <p className="text-sm text-gray-600 mb-2">Nốt: F - Ab - C</p>
                        <div className="font-mono text-sm bg-white p-3 rounded border">
                          <div>E |---1---</div>
                          <div>B |---1---</div>
                          <div>G |---1---</div>
                          <div>D |---3---</div>
                          <div>A |---3---</div>
                          <div>E |---1---</div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {selectedLesson.id === 4 && (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Hợp âm bảy thêm một nốt thứ bảy vào hợp âm tam, tạo ra âm thanh phức tạp và hay được dùng trong jazz, blues.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">C7 (Dominant 7th)</h4>
                      <p className="text-sm text-gray-600 mb-2">C - E - G - Bb</p>
                      <div className="font-mono text-xs bg-white p-2 rounded">
                        <div>E |---1---</div>
                        <div>B |---1---</div>
                        <div>G |---3---</div>
                        <div>D |---2---</div>
                        <div>A |---3---</div>
                        <div>E |-------</div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Cmaj7 (Major 7th)</h4>
                      <p className="text-sm text-gray-600 mb-2">C - E - G - B</p>
                      <div className="font-mono text-xs bg-white p-2 rounded">
                        <div>E |---0---</div>
                        <div>B |---0---</div>
                        <div>G |---0---</div>
                        <div>D |---2---</div>
                        <div>A |---3---</div>
                        <div>E |-------</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Progress value={selectedLesson.progress} className="w-full" />
              <p className="text-sm text-gray-500">Tiến độ bài học: {selectedLesson.progress}%</p>
            </CardContent>
          </Card>

          {/* Video Player Card */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-indigo-600" />
                <span>Video: {selectedLesson.title}</span>
              </CardTitle>
              <CardDescription>Hướng dẫn chi tiết từ giảng viên</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
                <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-medium">{selectedLesson.title}</p>
                    <p className="text-sm opacity-75">Thời lượng: {selectedLesson.duration}</p>
                  </div>
                </div>
                
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-4">
                  <div className="flex items-center space-x-4">
                    <Button size="sm" variant="secondary">
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full w-1/3"></div>
                    </div>
                    <span className="text-white text-sm">5:30 / {selectedLesson.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Xem Bản ghi
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => handleCompleteLesson(selectedLesson)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Hoàn thành bài học
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}