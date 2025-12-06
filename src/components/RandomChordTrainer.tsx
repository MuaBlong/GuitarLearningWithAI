import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Shuffle, Play, Pause, RotateCcw, Volume2, Timer, Target, Settings } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { toast } from 'sonner@2.0.3';

// Định nghĩa các hợp âm đầy đủ
const chordDatabase = {
  major: [
    { name: 'C', fullName: 'C Major', notes: 'C - E - G', finger: 'E|0 B|1 G|0 D|2 A|3 e|x', difficulty: 1 },
    { name: 'D', fullName: 'D Major', notes: 'D - F# - A', finger: 'E|2 B|3 G|2 D|0 A|x e|x', difficulty: 2 },
    { name: 'E', fullName: 'E Major', notes: 'E - G# - B', finger: 'E|0 B|0 G|1 D|2 A|2 e|0', difficulty: 1 },
    { name: 'F', fullName: 'F Major', notes: 'F - A - C', finger: 'E|1 B|1 G|2 D|3 A|3 e|1', difficulty: 4 },
    { name: 'G', fullName: 'G Major', notes: 'G - B - D', finger: 'E|3 B|0 G|0 D|0 A|2 e|3', difficulty: 2 },
    { name: 'A', fullName: 'A Major', notes: 'A - C# - E', finger: 'E|0 B|2 G|2 D|2 A|0 e|x', difficulty: 2 },
    { name: 'B', fullName: 'B Major', notes: 'B - D# - F#', finger: 'E|2 B|4 G|4 D|4 A|2 e|x', difficulty: 5 }
  ],
  minor: [
    { name: 'Am', fullName: 'A Minor', notes: 'A - C - E', finger: 'E|0 B|1 G|2 D|2 A|0 e|x', difficulty: 1 },
    { name: 'Em', fullName: 'E Minor', notes: 'E - G - B', finger: 'E|0 B|0 G|0 D|2 A|2 e|0', difficulty: 1 },
    { name: 'Dm', fullName: 'D Minor', notes: 'D - F - A', finger: 'E|1 B|3 G|2 D|0 A|x e|x', difficulty: 2 },
    { name: 'Cm', fullName: 'C Minor', notes: 'C - Eb - G', finger: 'E|3 B|4 G|5 D|5 A|3 e|x', difficulty: 5 },
    { name: 'Fm', fullName: 'F Minor', notes: 'F - Ab - C', finger: 'E|1 B|1 G|1 D|3 A|3 e|1', difficulty: 4 },
    { name: 'Gm', fullName: 'G Minor', notes: 'G - Bb - D', finger: 'E|3 B|3 G|3 D|5 A|5 e|3', difficulty: 5 },
    { name: 'Bm', fullName: 'B Minor', notes: 'B - D - F#', finger: 'E|2 B|3 G|4 D|4 A|2 e|x', difficulty: 4 }
  ],
  seventh: [
    { name: 'C7', fullName: 'C Dominant 7', notes: 'C - E - G - Bb', finger: 'E|1 B|1 G|3 D|2 A|3 e|x', difficulty: 3 },
    { name: 'D7', fullName: 'D Dominant 7', notes: 'D - F# - A - C', finger: 'E|2 B|1 G|2 D|0 A|x e|x', difficulty: 2 },
    { name: 'E7', fullName: 'E Dominant 7', notes: 'E - G# - B - D', finger: 'E|0 B|3 G|1 D|0 A|2 e|0', difficulty: 2 },
    { name: 'F7', fullName: 'F Dominant 7', notes: 'F - A - C - Eb', finger: 'E|1 B|1 G|2 D|1 A|3 e|1', difficulty: 4 },
    { name: 'G7', fullName: 'G Dominant 7', notes: 'G - B - D - F', finger: 'E|1 B|0 G|0 D|0 A|2 e|3', difficulty: 2 },
    { name: 'A7', fullName: 'A Dominant 7', notes: 'A - C# - E - G', finger: 'E|0 B|2 G|0 D|2 A|0 e|x', difficulty: 2 },
    { name: 'B7', fullName: 'B Dominant 7', notes: 'B - D# - F# - A', finger: 'E|2 B|0 G|2 D|1 A|2 e|x', difficulty: 3 }
  ]
};

interface RandomChordTrainerProps {
  onChordGenerated?: (chord: any) => void;
}

export function RandomChordTrainer({ onChordGenerated }: RandomChordTrainerProps) {
  const [currentChord, setCurrentChord] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [interval, setInterval] = useState([5]); // seconds
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['major', 'minor']);
  const [difficultyRange, setDifficultyRange] = useState([1, 3]);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Auto mode timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (autoMode && isPlaying && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (autoMode && isPlaying && timeLeft === 0) {
      generateRandomChord();
      setTimeLeft(interval[0]);
    }

    return () => clearTimeout(timer);
  }, [autoMode, isPlaying, timeLeft, interval]);

  // Lấy tất cả hợp âm phù hợp với filter
  const getFilteredChords = useCallback(() => {
    const allChords: any[] = [];
    
    selectedTypes.forEach(type => {
      if (chordDatabase[type as keyof typeof chordDatabase]) {
        const chords = chordDatabase[type as keyof typeof chordDatabase];
        chords.forEach(chord => {
          if (chord.difficulty >= difficultyRange[0] && chord.difficulty <= difficultyRange[1]) {
            allChords.push({ ...chord, type });
          }
        });
      }
    });

    return allChords;
  }, [selectedTypes, difficultyRange]);

  // Tạo hợp âm ngẫu nhiên
  const generateRandomChord = useCallback(() => {
    const filteredChords = getFilteredChords();
    
    if (filteredChords.length === 0) {
      toast.error('Không có hợp âm nào phù hợp với tiêu chí đã chọn!');
      return;
    }

    let newChord;
    do {
      newChord = filteredChords[Math.floor(Math.random() * filteredChords.length)];
    } while (filteredChords.length > 1 && newChord?.name === currentChord?.name);

    setCurrentChord(newChord);
    setShowAnswer(false);
    setTimeLeft(interval[0]);
    
    if (onChordGenerated) {
      onChordGenerated(newChord);
    }

    // Auto play chord sound
    setTimeout(() => {
      audioEngine.playChordFromFingerPattern(newChord.finger, 2);
    }, 100);
  }, [currentChord, getFilteredChords, interval, onChordGenerated]);

  // Bắt đầu/Dừng auto mode
  const toggleAutoMode = () => {
    if (!autoMode) {
      if (!currentChord) {
        generateRandomChord();
      }
      setIsPlaying(true);
      setTimeLeft(interval[0]);
    } else {
      setIsPlaying(false);
    }
    setAutoMode(!autoMode);
  };

  // Play chord sound
  const playChordSound = async () => {
    if (currentChord) {
      try {
        await audioEngine.playChordFromFingerPattern(currentChord.finger, 2);
      } catch (error) {
        console.error('Error playing chord:', error);
        toast.error('Không thể phát âm thanh');
      }
    }
  };

  // Handle type selection
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Correct/Incorrect feedback
  const handleFeedback = (correct: boolean) => {
    setTotalCount(prev => prev + 1);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      toast.success(`Chính xác! 🎉 Streak: ${streak + 1}`);
    } else {
      setStreak(0);
      toast.error('Chưa đúng, thử lại! 💪');
    }
    
    setShowAnswer(true);
    
    // Auto generate next chord after 2 seconds
    setTimeout(() => {
      if (autoMode) {
        generateRandomChord();
      }
    }, 2000);
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-800 border-green-200';
    if (level <= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getDifficultyText = (level: number) => {
    if (level <= 2) return 'Dễ';
    if (level <= 3) return 'Trung bình';
    return 'Khó';
  };

  const accuracy = totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            <span>Cài đặt Luyện tập Ngẫu nhiên</span>
          </CardTitle>
          <CardDescription>Tùy chỉnh chế độ luyện tập hợp âm ngẫu nhiên</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chord Types Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Loại hợp âm:</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(chordDatabase).map(type => (
                <Button
                  key={type}
                  variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeToggle(type)}
                  className="text-xs"
                >
                  {type === 'major' && 'Trưởng'}
                  {type === 'minor' && 'Thứ'}
                  {type === 'seventh' && 'Bảy'}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Độ khó: {difficultyRange[0]} - {difficultyRange[1]}
            </label>
            <Slider
              value={difficultyRange}
              onValueChange={setDifficultyRange}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Dễ (1)</span>
              <span>Trung bình (3)</span>
              <span>Khó (5)</span>
            </div>
          </div>

          {/* Auto Mode Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Chế độ tự động:</label>
              <Switch checked={autoMode} onCheckedChange={toggleAutoMode} />
            </div>
            
            {autoMode && (
              <div className="space-y-2">
                <label className="text-sm text-gray-600">
                  Thời gian mỗi hợp âm: {interval[0]} giây
                </label>
                <Slider
                  value={interval}
                  onValueChange={setInterval}
                  max={30}
                  min={3}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Practice Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Chord Display */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-indigo-600" />
                <span>Hợp âm Hiện tại</span>
              </div>
              {autoMode && timeLeft > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Timer className="h-4 w-4" />
                  <span>{timeLeft}s</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentChord ? (
              <div className="text-center space-y-4">
                {!showAnswer ? (
                  <>
                    <div className="text-6xl font-bold text-indigo-600 mb-4">?</div>
                    <p className="text-lg text-gray-600">Đoán hợp âm này là gì?</p>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleFeedback(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Biết rồi ✓
                      </Button>
                      <Button 
                        onClick={() => handleFeedback(false)}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Chưa biết ✗
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl font-bold text-indigo-600">{currentChord.name}</div>
                    <p className="text-lg text-gray-700">{currentChord.fullName}</p>
                    <p className="text-sm text-gray-500">Nốt: {currentChord.notes}</p>
                    <Badge className={getDifficultyColor(currentChord.difficulty)}>
                      Độ khó: {getDifficultyText(currentChord.difficulty)}
                    </Badge>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Chưa có hợp âm nào được tạo</p>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex space-x-2">
              <Button onClick={generateRandomChord} className="flex-1">
                <Shuffle className="h-4 w-4 mr-2" />
                Hợp âm mới
              </Button>
              <Button 
                onClick={playChordSound} 
                variant="outline"
                disabled={!currentChord}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-indigo-600" />
              <span>Thống kê Luyện tập</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{correctCount}</div>
                <div className="text-sm text-blue-600">Đúng</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{totalCount}</div>
                <div className="text-sm text-gray-600">Tổng</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-sm text-green-600">Độ chính xác</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{streak}</div>
                <div className="text-sm text-orange-600">Chuỗi đúng</div>
              </div>
            </div>

            <Button 
              onClick={() => {
                setCorrectCount(0);
                setTotalCount(0);
                setStreak(0);
                toast.success('Đã reset thống kê!');
              }}
              variant="outline" 
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset thống kê
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar for Auto Mode */}
      {autoMode && timeLeft > 0 && (
        <Card className="shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Thời gian còn lại</span>
                <span>{timeLeft}s / {interval[0]}s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(timeLeft / interval[0]) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtered Chords Preview */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Hợp âm sẽ được luyện tập</CardTitle>
          <CardDescription>
            Tổng cộng {getFilteredChords().length} hợp âm phù hợp với tiêu chí
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getFilteredChords().slice(0, 20).map((chord, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {chord.name}
              </Badge>
            ))}
            {getFilteredChords().length > 20 && (
              <Badge variant="outline" className="text-xs">
                +{getFilteredChords().length - 20} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}