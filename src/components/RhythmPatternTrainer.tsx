import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Pause, Square, RotateCcw, Volume2, Timer, Target, Music } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { toast } from 'sonner@2.0.3';

// Định nghĩa các pattern đệm khác nhau
const rhythmPatterns = {
  basic: {
    name: 'Đệm cơ bản',
    description: 'Down-Down-Up-Up-Down-Up',
    pattern: [
      { beat: 0, type: 'down' as const, duration: 0.3 },
      { beat: 1, type: 'down' as const, duration: 0.3 },
      { beat: 1.5, type: 'up' as const, duration: 0.2 },
      { beat: 2.5, type: 'up' as const, duration: 0.2 },
      { beat: 3, type: 'down' as const, duration: 0.3 },
      { beat: 3.5, type: 'up' as const, duration: 0.2 }
    ],
    difficulty: 1
  },
  folk: {
    name: 'Đệm Folk',
    description: 'Down-Down-Up-Down-Up',
    pattern: [
      { beat: 0, type: 'down' as const, duration: 0.3 },
      { beat: 1, type: 'down' as const, duration: 0.3 },
      { beat: 1.5, type: 'up' as const, duration: 0.2 },
      { beat: 2, type: 'down' as const, duration: 0.3 },
      { beat: 2.5, type: 'up' as const, duration: 0.2 }
    ],
    difficulty: 2
  },
  rock: {
    name: 'Đệm Rock',
    description: 'Down-Mute-Down-Up-Mute-Down-Up',
    pattern: [
      { beat: 0, type: 'down' as const, duration: 0.2 },
      { beat: 0.5, type: 'mute' as const, duration: 0.1 },
      { beat: 1, type: 'down' as const, duration: 0.2 },
      { beat: 1.5, type: 'up' as const, duration: 0.15 },
      { beat: 2.5, type: 'mute' as const, duration: 0.1 },
      { beat: 3, type: 'down' as const, duration: 0.2 },
      { beat: 3.5, type: 'up' as const, duration: 0.15 }
    ],
    difficulty: 3
  },
  ballad: {
    name: 'Đệm Ballad',
    description: 'Down-Down-Down-Down (Chậm)',
    pattern: [
      { beat: 0, type: 'down' as const, duration: 0.4 },
      { beat: 1, type: 'down' as const, duration: 0.4 },
      { beat: 2, type: 'down' as const, duration: 0.4 },
      { beat: 3, type: 'down' as const, duration: 0.4 }
    ],
    difficulty: 1
  },
  fingerpicking: {
    name: 'Tỉa (Fingerpicking)',
    description: 'Bass-Treble-Bass-Treble',
    pattern: [
      { beat: 0, type: 'down' as const, duration: 0.3 }, // Bass note
      { beat: 0.5, type: 'up' as const, duration: 0.2 }, // Treble
      { beat: 1, type: 'down' as const, duration: 0.3 }, // Bass
      { beat: 1.5, type: 'up' as const, duration: 0.2 }, // Treble
      { beat: 2, type: 'down' as const, duration: 0.3 }, // Bass
      { beat: 2.5, type: 'up' as const, duration: 0.2 }, // Treble
      { beat: 3, type: 'down' as const, duration: 0.3 }, // Bass
      { beat: 3.5, type: 'up' as const, duration: 0.2 }  // Treble
    ],
    difficulty: 4
  },
  country: {
    name: 'Đệm Country',
    description: 'Down-Up-Mute-Up-Down-Up-Mute-Up',
    pattern: [
      { beat: 0, type: 'down' as const, duration: 0.2 },
      { beat: 0.5, type: 'up' as const, duration: 0.15 },
      { beat: 1, type: 'mute' as const, duration: 0.1 },
      { beat: 1.5, type: 'up' as const, duration: 0.15 },
      { beat: 2, type: 'down' as const, duration: 0.2 },
      { beat: 2.5, type: 'up' as const, duration: 0.15 },
      { beat: 3, type: 'mute' as const, duration: 0.1 },
      { beat: 3.5, type: 'up' as const, duration: 0.15 }
    ],
    difficulty: 3
  }
};

// Hợp âm mẫu để thực hành
const practiceChords = [
  { name: 'C', finger: 'E|0 B|1 G|0 D|2 A|3 e|x' },
  { name: 'G', finger: 'E|3 B|0 G|0 D|0 A|2 e|3' },
  { name: 'Am', finger: 'E|0 B|1 G|2 D|2 A|0 e|x' },
  { name: 'F', finger: 'E|1 B|1 G|2 D|3 A|3 e|1' },
  { name: 'Dm', finger: 'E|1 B|3 G|2 D|0 A|x e|x' },
  { name: 'Em', finger: 'E|0 B|0 G|0 D|2 A|2 e|0' }
];

interface RhythmPatternTrainerProps {
  initialChord?: string;
}

export function RhythmPatternTrainer({ initialChord }: RhythmPatternTrainerProps) {
  const [selectedPattern, setSelectedPattern] = useState<string>('basic');
  const [selectedChord, setSelectedChord] = useState(initialChord || 'C');
  const [tempo, setTempo] = useState([120]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [showMetronome, setShowMetronome] = useState(true);
  const [volume, setVolume] = useState([0.5]);
  const [practiceMode, setPracticeMode] = useState<'pattern' | 'progression'>('pattern');
  const [progressionChords, setProgressionChords] = useState(['C', 'G', 'Am', 'F']);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [measureCount, setMeasureCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentPattern = rhythmPatterns[selectedPattern as keyof typeof rhythmPatterns];
  const currentChordData = practiceChords.find(c => c.name === selectedChord) || practiceChords[0];

  // Update audio engine settings
  useEffect(() => {
    audioEngine.updateSettings({ 
      volume: volume[0], 
      tempo: tempo[0] 
    });
  }, [volume, tempo]);

  // Play pattern
  const playPattern = useCallback(async () => {
    if (!currentPattern || !currentChordData) return;

    try {
      await audioEngine.playRhythmPattern(
        currentChordData.finger,
        currentPattern.pattern,
        tempo[0]
      );

      // Play metronome clicks if enabled
      if (showMetronome) {
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            audioEngine.playMetronomeClick(i === 0);
          }, (i * 60000) / tempo[0]);
        }
      }
    } catch (error) {
      console.error('Error playing pattern:', error);
      toast.error('Không thể phát pattern');
    }
  }, [currentPattern, currentChordData, tempo, showMetronome]);

  // Start/Stop playing
  const togglePlaying = async () => {
    if (isPlaying) {
      // Stop
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      // Start
      setIsPlaying(true);
      startTimeRef.current = Date.now();
      
      // Play immediately
      playPattern();
      
      // Set up interval for continuous playing
      const beatDuration = (60 / tempo[0]) * 1000; // Convert to milliseconds
      const measureDuration = beatDuration * 4; // 4 beats per measure
      
      intervalRef.current = setInterval(() => {
        setMeasureCount(prev => prev + 1);
        
        // Change chord in progression mode
        if (practiceMode === 'progression') {
          setCurrentChordIndex(prev => (prev + 1) % progressionChords.length);
          const nextChord = progressionChords[(currentChordIndex + 1) % progressionChords.length];
          setSelectedChord(nextChord);
        }
        
        playPattern();
      }, measureDuration);

      // Beat indicator
      const beatInterval = setInterval(() => {
        if (!isPlaying) {
          clearInterval(beatInterval);
          return;
        }
        setCurrentBeat(prev => (prev + 1) % 4);
      }, beatDuration);
    }
  };

  // Stop playing
  const stopPlaying = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
    setMeasureCount(0);
    setCurrentChordIndex(0);
  };

  // Reset
  const reset = () => {
    stopPlaying();
    setSelectedChord(practiceMode === 'progression' ? progressionChords[0] : 'C');
    setCurrentChordIndex(0);
    setMeasureCount(0);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="h-5 w-5 text-indigo-600" />
            <span>Luyện tập Rhythm & Đệm</span>
          </CardTitle>
          <CardDescription>
            Thực hành các pattern đệm khác nhau với tempo và hợp âm tùy chỉnh
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Cài đặt Pattern</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Practice Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chế độ luyện tập:</label>
              <Select value={practiceMode} onValueChange={(value: 'pattern' | 'progression') => setPracticeMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pattern">Pattern đơn</SelectItem>
                  <SelectItem value="progression">Progression (dãy hợp âm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pattern Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn Pattern:</label>
              <Select value={selectedPattern} onValueChange={setSelectedPattern}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(rhythmPatterns).map(([key, pattern]) => (
                    <SelectItem key={key} value={key}>
                      {pattern.name} - {pattern.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pattern Info */}
            {currentPattern && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{currentPattern.name}</span>
                  <Badge className={getDifficultyColor(currentPattern.difficulty)}>
                    {getDifficultyText(currentPattern.difficulty)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{currentPattern.description}</p>
              </div>
            )}

            {/* Chord Selection */}
            {practiceMode === 'pattern' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Hợp âm:</label>
                <Select value={selectedChord} onValueChange={setSelectedChord}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {practiceChords.map(chord => (
                      <SelectItem key={chord.name} value={chord.name}>
                        {chord.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Dãy hợp âm:</label>
                <div className="flex flex-wrap gap-2">
                  {progressionChords.map((chord, index) => (
                    <Badge 
                      key={index} 
                      variant={index === currentChordIndex ? 'default' : 'outline'}
                      className="px-3 py-1"
                    >
                      {chord}
                    </Badge>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setProgressionChords(['C', 'Am', 'F', 'G'])}
                >
                  Thay đổi progression
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Cài đặt Âm thanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tempo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tempo: {tempo[0]} BPM
              </label>
              <Slider
                value={tempo}
                onValueChange={setTempo}
                max={200}
                min={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Chậm (60)</span>
                <span>Trung bình (120)</span>
                <span>Nhanh (200)</span>
              </div>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Âm lượng: {Math.round(volume[0] * 100)}%
              </label>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Metronome */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Metronome:</label>
              <Button
                variant={showMetronome ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMetronome(!showMetronome)}
              >
                <Timer className="h-4 w-4 mr-1" />
                {showMetronome ? 'Bật' : 'Tắt'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Player */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Player</span>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Measure: {measureCount + 1}</span>
              {practiceMode === 'progression' && (
                <span>| Chord: {selectedChord}</span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Beat Indicator */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3].map(beat => (
              <div
                key={beat}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  isPlaying && currentBeat === beat
                    ? 'bg-indigo-600 border-indigo-600 scale-125'
                    : 'bg-gray-200 border-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Current Chord Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {selectedChord}
            </div>
            <p className="text-sm text-gray-600">
              {currentPattern.description}
            </p>
          </div>

          {/* Pattern Visualization */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-1">
              {currentPattern.pattern.map((stroke, index) => (
                <div
                  key={index}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    stroke.type === 'down' 
                      ? 'bg-blue-100 text-blue-800' 
                      : stroke.type === 'up'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {stroke.type === 'down' ? '↓' : stroke.type === 'up' ? '↑' : 'X'}
                </div>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={togglePlaying}
              className={`flex-1 ${
                isPlaying 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Tạm dừng
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Phát
                </>
              )}
            </Button>
            
            <Button onClick={stopPlaying} variant="outline">
              <Square className="h-4 w-4 mr-2" />
              Dừng
            </Button>
            
            <Button onClick={reset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button onClick={playPattern} variant="outline">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Library */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Thư viện Pattern</CardTitle>
          <CardDescription>Tất cả pattern đệm có sẵn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(rhythmPatterns).map(([key, pattern]) => (
              <div
                key={key}
                onClick={() => setSelectedPattern(key)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPattern === key
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{pattern.name}</h4>
                    <Badge className={getDifficultyColor(pattern.difficulty)}>
                      {getDifficultyText(pattern.difficulty)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{pattern.description}</p>
                  <div className="flex space-x-1">
                    {pattern.pattern.slice(0, 6).map((stroke, index) => (
                      <span
                        key={index}
                        className={`text-xs px-1 py-0.5 rounded ${
                          stroke.type === 'down' 
                            ? 'bg-blue-100 text-blue-700' 
                            : stroke.type === 'up'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {stroke.type === 'down' ? '↓' : stroke.type === 'up' ? '↑' : 'X'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}