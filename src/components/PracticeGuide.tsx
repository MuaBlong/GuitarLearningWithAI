import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Shuffle, Activity, Zap, Volume2, Target, Timer, BookOpen, Music2 } from 'lucide-react';

export function PracticeGuide() {
  const practiceFeatures = [
    {
      id: 'chords',
      icon: Target,
      title: 'Luyện Hợp Âm Cơ Bản',
      description: 'Học các hợp âm theo chương trình có sẵn với AI nhận diện',
      features: [
        'Chọn chương trình từ cơ bản đến nâng cao',
        'AI nhận diện hợp âm qua microphone', 
        'Hiển thị fingering trên fretboard',
        'Feedback thời gian thực'
      ],
      difficulty: 'Cơ bản',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'random',
      icon: Shuffle,
      title: 'Random Hợp Âm',
      description: 'Luyện tập hợp âm ngẫu nhiên với thống kê tiến độ',
      features: [
        'Tạo hợp âm ngẫu nhiên theo tiêu chí',
        'Chế độ tự động với timer',
        'Thống kê độ chính xác',
        'Lọc theo độ khó và loại hợp âm'
      ],
      difficulty: 'Trung cấp',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'rhythm',
      icon: Activity,
      title: 'Luyện Rhythm & Đệm',
      description: 'Thực hành các pattern đệm với âm thanh thực tế',
      features: [
        'Nhiều pattern đệm khác nhau (Folk, Rock, Country)',
        'Strumming và Fingerpicking',
        'Điều chỉnh tempo và volume',
        'Visual feedback cho rhythm'
      ],
      difficulty: 'Nâng cao',
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'interactive',
      icon: Zap,
      title: 'Chế Độ Tương Tác',
      description: 'Bài tập có hướng dẫn với feedback trực tiếp',
      features: [
        'Bài tập khớp hợp âm theo thời gian',
        'Luyện theo rhythm pattern',
        'Thực hành progression',
        'Scoring và đánh giá hiệu suất'
      ],
      difficulty: 'Chuyên nghiệp',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      id: 'tempo',
      icon: Timer,
      title: 'Tempo Trainer',
      description: 'Luyện tập chuyển đổi hợp âm theo metronome',
      features: [
        'Metronome với BPM điều chỉnh được',
        'Chuyển đổi hợp âm theo beat',
        'Visual countdown',
        'Multiple time signatures'
      ],
      difficulty: 'Trung cấp',
      color: 'bg-indigo-50 border-indigo-200'
    },
    {
      id: 'songs',
      icon: BookOpen,
      title: 'Thư Viện Bài Hát',
      description: 'Học chơi các bài hát thật với chord progressions',
      features: [
        'Bài hát từ cơ bản đến nâng cao',
        'Chord progression hiển thị theo thời gian',
        'Lyrics và chord chart',
        'Play-along backing tracks'
      ],
      difficulty: 'Đa cấp độ',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      id: 'notes',
      icon: Music2,
      title: 'Single Note Trainer',
      description: 'Luyện tập note đơn và scale trên fretboard',
      features: [
        'Nhận diện note trên từng dây',
        'Scale training',
        'Fretboard memorization',
        'Ear training cho single notes'
      ],
      difficulty: 'Cơ bản',
      color: 'bg-teal-50 border-teal-200'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Cơ bản': return 'bg-green-100 text-green-800';
      case 'Trung cấp': return 'bg-yellow-100 text-yellow-800';
      case 'Nâng cao': return 'bg-orange-100 text-orange-800';
      case 'Chuyên nghiệp': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-indigo-600" />
            <span>Hướng Dẫn Sử Dụng Chế Độ Luyện Tập</span>
          </CardTitle>
          <CardDescription>
            Khám phá tất cả các tính năng luyện tập với âm thanh thực tế và AI hỗ trợ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {practiceFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.id} className={`${feature.color} border`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5" />
                        <span>{feature.title}</span>
                      </div>
                      <Badge className={getDifficultyColor(feature.difficulty)}>
                        {feature.difficulty}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1 text-sm">
                      {feature.features.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-indigo-600 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Audio Features Highlight */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-indigo-600" />
            <span>Tính Năng Âm Thanh Nâng Cao</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-indigo-600 mb-2">🎵 Web Audio API</h4>
              <p className="text-sm text-gray-600">
                Tạo âm thanh guitar thực tế bằng oscillator và filter
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-indigo-600 mb-2">🎸 Chord Synthesis</h4>
              <p className="text-sm text-gray-600">
                Phát hợp âm từ finger pattern với âm thanh tự nhiên
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-indigo-600 mb-2">🥁 Rhythm Engine</h4>
              <p className="text-sm text-gray-600">
                Pattern đệm với strumming, muting và fingerpicking
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-indigo-600 mb-2">⏰ Metronome</h4>
              <p className="text-sm text-gray-600">
                Click tracks với accent beats và tempo điều chỉnh
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-indigo-600 mb-2">🔊 Volume Control</h4>
              <p className="text-sm text-gray-600">
                Điều chỉnh âm lượng cho từng component riêng biệt
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-indigo-600 mb-2">📊 Real-time Feedback</h4>
              <p className="text-sm text-gray-600">
                Visual và audio feedback tức thì cho mỗi action
              </p>
            </div>
          </div>

          <Separator />

          <div className="text-center space-y-2">
            <h4 className="font-medium text-gray-900">🚀 Cách Bắt Đầu</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
              <div className="p-2 bg-white rounded border">
                <strong>1.</strong> Cho phép quyền microphone
              </div>
              <div className="p-2 bg-white rounded border">
                <strong>2.</strong> Chọn chế độ luyện tập
              </div>
              <div className="p-2 bg-white rounded border">
                <strong>3.</strong> Điều chỉnh settings
              </div>
              <div className="p-2 bg-white rounded border">
                <strong>4.</strong> Bắt đầu luyện tập!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips and Tricks */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>💡 Tips & Tricks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Cho Người Mới Bắt Đầu:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Bắt đầu với chế độ "Hợp âm" để học finger positions</li>
                <li>• Dùng tempo chậm (60-80 BPM) khi mới học</li>
                <li>• Luyện tập ít nhất 15 phút mỗi ngày</li>
                <li>• Sử dụng Random mode để test kiến thức</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Cho Người Nâng Cao:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Thử chế độ Interactive với bài tập phức tạp</li>
                <li>• Luyện rhythm patterns với tempo cao</li>
                <li>• Kết hợp nhiều chế độ trong một session</li>
                <li>• Theo dõi thống kê để cải thiện</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}