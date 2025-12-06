import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Play, Pause, Square, RotateCcw, Timer, Music } from 'lucide-react';

interface TempoTrainerProps {
  chords: string[];
  onChordChange?: (chord: string, index: number) => void;
}

export function TempoTrainer({ chords, onChordChange }: TempoTrainerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [tempo, setTempo] = useState([80]); // BPM
  const [timePerChord, setTimePerChord] = useState([4]); // beats per chord
  const [currentBeat, setCurrentBeat] = useState(1);
  const [totalBeats, setTotalBeats] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Calculate interval based on tempo
  const beatInterval = 60000 / tempo[0]; // ms per beat
  const chordInterval = beatInterval * timePerChord[0]; // ms per chord

  // Chord progression sequences
  const progressions = [
    { name: 'Pop Cơ bản', chords: ['C', 'G', 'Am', 'F'] },
    { name: 'Blues 12-bar', chords: ['C', 'C', 'C', 'C', 'F', 'F', 'C', 'C', 'G', 'F', 'C', 'G'] },
    { name: 'Jazz ii-V-I', chords: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'] },
    { name: 'Rock Progression', chords: ['Em', 'C', 'G', 'D'] },
    { name: 'Ballad Việt', chords: ['Am', 'F', 'C', 'G'] },
    { name: 'Dân ca miền Nam', chords: ['C', 'Am', 'Dm', 'G'] }
  ];

  const [selectedProgression, setSelectedProgression] = useState(progressions[0]);
  const [customChords, setCustomChords] = useState(chords);

  useEffect(() => {
    setCustomChords(chords);
  }, [chords]);

  useEffect(() => {
    if (isPlaying && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current!;
        const totalChordTime = chordInterval;
        const currentChordElapsed = elapsed % totalChordTime;
        const currentBeatNumber = Math.floor(currentChordElapsed / beatInterval) + 1;
        const newChordIndex = Math.floor(elapsed / totalChordTime) % getCurrentChords().length;

        setCurrentBeat(Math.min(currentBeatNumber, timePerChord[0]));
        
        if (newChordIndex !== currentChordIndex) {
          setCurrentChordIndex(newChordIndex);
          const currentChords = getCurrentChords();
          onChordChange?.(currentChords[newChordIndex], newChordIndex);
        }

        setTotalBeats(Math.floor(elapsed / beatInterval));
      }, 50); // Update every 50ms for smooth animation
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, tempo, timePerChord, currentChordIndex, chordInterval, beatInterval]);

  const getCurrentChords = () => {
    return customChords.length > 0 ? customChords : selectedProgression.chords;
  };

  const start = () => {
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    setCurrentBeat(1);
    setTotalBeats(0);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const stop = () => {
    setIsPlaying(false);
    setCurrentChordIndex(0);
    setCurrentBeat(1);
    setTotalBeats(0);
    startTimeRef.current = null;
    const currentChords = getCurrentChords();
    onChordChange?.(currentChords[0], 0);
  };

  const reset = () => {
    stop();
  };

  const currentChords = getCurrentChords();
  const currentChord = currentChords[currentChordIndex];

  // Calculate progress within current chord
  const chordProgress = ((currentBeat - 1) / timePerChord[0]) * 100;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-indigo-600" />
          <span>Luyện tập Theo Tempo</span>
        </CardTitle>
        <CardDescription>
          Thực hành chuyển đổi hợp âm theo nhịp độ chuẩn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progression Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Chọn Progression:</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {progressions.map((prog) => (
              <Button
                key={prog.name}
                variant={selectedProgression.name === prog.name ? "default" : "outline"}
                size="sm"
                className="text-xs h-auto py-2"
                onClick={() => setSelectedProgression(prog)}
              >
                <div className="text-center">
                  <div className="font-medium">{prog.name}</div>
                  <div className="text-xs opacity-75">
                    {prog.chords.slice(0, 4).join(' - ')}
                    {prog.chords.length > 4 && '...'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Chord Display */}
        <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
          <div className="text-4xl font-bold text-indigo-600 mb-2">
            {currentChord}
          </div>
          <div className="text-sm text-gray-600 mb-3">
            Hợp âm {currentChordIndex + 1} / {currentChords.length}
          </div>
          
          {/* Beat indicator */}
          <div className="flex items-center justify-center space-x-2 mb-3">
            {[...Array(timePerChord[0])].map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  idx < currentBeat
                    ? 'bg-indigo-600 scale-110'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${chordProgress}%` }}
            />
          </div>

          <div className="text-xs text-gray-500">
            Beat {currentBeat} / {timePerChord[0]} • Tổng: {totalBeats} beats
          </div>
        </div>

        {/* Chord Sequence */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Chuỗi Hợp âm:</label>
          <div className="flex flex-wrap gap-2">
            {currentChords.map((chord, idx) => (
              <Badge
                key={idx}
                variant={idx === currentChordIndex ? "default" : "outline"}
                className={`${
                  idx === currentChordIndex
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600'
                } cursor-pointer transition-all`}
                onClick={() => {
                  if (!isPlaying) {
                    setCurrentChordIndex(idx);
                    onChordChange?.(chord, idx);
                  }
                }}
              >
                {chord}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tempo Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tempo: {tempo[0]} BPM
            </label>
            <Slider
              value={tempo}
              onValueChange={setTempo}
              min={40}
              max={180}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Chậm (40)</span>
              <span>Nhanh (180)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Beats/Hợp âm: {timePerChord[0]}
            </label>
            <Slider
              value={timePerChord}
              onValueChange={setTimePerChord}
              min={1}
              max={8}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 beat</span>
              <span>8 beats</span>
            </div>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex space-x-2">
          {!isPlaying ? (
            <Button onClick={start} className="flex-1 bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Bắt đầu
            </Button>
          ) : (
            <Button onClick={pause} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
              <Pause className="h-4 w-4 mr-2" />
              Tạm dừng
            </Button>
          )}
          
          <Button onClick={stop} variant="outline" className="flex-1">
            <Square className="h-4 w-4 mr-2" />
            Dừng
          </Button>
          
          <Button onClick={reset} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Music className="h-4 w-4 mr-2" />
            Mẹo luyện tập:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Bắt đầu với tempo chậm (60-80 BPM)</li>
            <li>• Tập trung vào việc chuyển hợp âm chính xác trước khi tăng tốc</li>
            <li>• Sử dụng metronome để giữ nhịp ổn định</li>
            <li>• Luyện tập 15-20 phút mỗi ngày để có kết quả tốt nhất</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}