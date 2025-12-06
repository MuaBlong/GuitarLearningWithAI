import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Pause, Square, RotateCcw, Music2, Target, Volume2 } from 'lucide-react';

interface Note {
  name: string;
  string: number; // 1-6 (from high E to low E)
  fret: number;   // 0-12
  frequency: number;
}

const NOTES_DATABASE: Note[] = [
  // 1st string (high E)
  { name: 'E4', string: 1, fret: 0, frequency: 329.63 },
  { name: 'F4', string: 1, fret: 1, frequency: 349.23 },
  { name: 'F#4', string: 1, fret: 2, frequency: 369.99 },
  { name: 'G4', string: 1, fret: 3, frequency: 392.00 },
  { name: 'G#4', string: 1, fret: 4, frequency: 415.30 },
  { name: 'A4', string: 1, fret: 5, frequency: 440.00 },
  { name: 'A#4', string: 1, fret: 6, frequency: 466.16 },
  { name: 'B4', string: 1, fret: 7, frequency: 493.88 },
  { name: 'C5', string: 1, fret: 8, frequency: 523.25 },
  
  // 2nd string (B)
  { name: 'B3', string: 2, fret: 0, frequency: 246.94 },
  { name: 'C4', string: 2, fret: 1, frequency: 261.63 },
  { name: 'C#4', string: 2, fret: 2, frequency: 277.18 },
  { name: 'D4', string: 2, fret: 3, frequency: 293.66 },
  { name: 'D#4', string: 2, fret: 4, frequency: 311.13 },
  { name: 'E4', string: 2, fret: 5, frequency: 329.63 },
  { name: 'F4', string: 2, fret: 6, frequency: 349.23 },
  { name: 'F#4', string: 2, fret: 7, frequency: 369.99 },
  { name: 'G4', string: 2, fret: 8, frequency: 392.00 },
  
  // 3rd string (G)
  { name: 'G3', string: 3, fret: 0, frequency: 196.00 },
  { name: 'G#3', string: 3, fret: 1, frequency: 207.65 },
  { name: 'A3', string: 3, fret: 2, frequency: 220.00 },
  { name: 'A#3', string: 3, fret: 3, frequency: 233.08 },
  { name: 'B3', string: 3, fret: 4, frequency: 246.94 },
  { name: 'C4', string: 3, fret: 5, frequency: 261.63 },
  { name: 'C#4', string: 3, fret: 6, frequency: 277.18 },
  { name: 'D4', string: 3, fret: 7, frequency: 293.66 },
  { name: 'D#4', string: 3, fret: 8, frequency: 311.13 },
  
  // 4th string (D)
  { name: 'D3', string: 4, fret: 0, frequency: 146.83 },
  { name: 'D#3', string: 4, fret: 1, frequency: 155.56 },
  { name: 'E3', string: 4, fret: 2, frequency: 164.81 },
  { name: 'F3', string: 4, fret: 3, frequency: 174.61 },
  { name: 'F#3', string: 4, fret: 4, frequency: 185.00 },
  { name: 'G3', string: 4, fret: 5, frequency: 196.00 },
  { name: 'G#3', string: 4, fret: 6, frequency: 207.65 },
  { name: 'A3', string: 4, fret: 7, frequency: 220.00 },
  { name: 'A#3', string: 4, fret: 8, frequency: 233.08 },
  
  // 5th string (A)
  { name: 'A2', string: 5, fret: 0, frequency: 110.00 },
  { name: 'A#2', string: 5, fret: 1, frequency: 116.54 },
  { name: 'B2', string: 5, fret: 2, frequency: 123.47 },
  { name: 'C3', string: 5, fret: 3, frequency: 130.81 },
  { name: 'C#3', string: 5, fret: 4, frequency: 138.59 },
  { name: 'D3', string: 5, fret: 5, frequency: 146.83 },
  { name: 'D#3', string: 5, fret: 6, frequency: 155.56 },
  { name: 'E3', string: 5, fret: 7, frequency: 164.81 },
  { name: 'F3', string: 5, fret: 8, frequency: 174.61 },
  
  // 6th string (low E)
  { name: 'E2', string: 6, fret: 0, frequency: 82.41 },
  { name: 'F2', string: 6, fret: 1, frequency: 87.31 },
  { name: 'F#2', string: 6, fret: 2, frequency: 92.50 },
  { name: 'G2', string: 6, fret: 3, frequency: 98.00 },
  { name: 'G#2', string: 6, fret: 4, frequency: 103.83 },
  { name: 'A2', string: 6, fret: 5, frequency: 110.00 },
  { name: 'A#2', string: 6, fret: 6, frequency: 116.54 },
  { name: 'B2', string: 6, fret: 7, frequency: 123.47 },
  { name: 'C3', string: 6, fret: 8, frequency: 130.81 }
];

const PRACTICE_MODES = [
  {
    id: 'chromatic',
    name: 'Chromatic (Nửa cung)',
    description: 'Luyện tập tất cả nốt theo thứ tự nửa cung',
    notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  },
  {
    id: 'major_scale',
    name: 'Major Scale (Âm giai Trưởng)',
    description: 'Âm giai Do trưởng cơ bản',
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  },
  {
    id: 'pentatonic',
    name: 'Pentatonic (Ngũ cung)',
    description: 'Âm giai pentatonic phổ biến',
    notes: ['C', 'D', 'E', 'G', 'A']
  },
  {
    id: 'blues',
    name: 'Blues Scale',
    description: 'Âm giai blues với blue notes',
    notes: ['C', 'D#', 'F', 'F#', 'G', 'A#']
  }
];

interface SingleNoteTrainerProps {
  onNotePlay?: (note: Note) => void;
}

export function SingleNoteTrainer({ onNotePlay }: SingleNoteTrainerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [tempo, setTempo] = useState([100]); // BPM
  const [selectedMode, setSelectedMode] = useState(PRACTICE_MODES[0]);
  const [selectedString, setSelectedString] = useState('all');
  const [selectedFretRange, setSelectedFretRange] = useState([0, 5]);
  const [showTabNotation, setShowTabNotation] = useState(true);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Filter notes based on selected criteria
  const getFilteredNotes = (): Note[] => {
    let filteredNotes = NOTES_DATABASE.filter(note => {
      const inFretRange = note.fret >= selectedFretRange[0] && note.fret <= selectedFretRange[1];
      const onCorrectString = selectedString === 'all' || note.string.toString() === selectedString;
      const noteBaseName = note.name.replace(/[0-9]/g, '');
      const inMode = selectedMode.notes.includes(noteBaseName);
      
      return inFretRange && onCorrectString && inMode;
    });

    // Sort by string then fret for logical progression
    return filteredNotes.sort((a, b) => {
      if (a.string !== b.string) return a.string - b.string;
      return a.fret - b.fret;
    });
  };

  const currentNotes = getFilteredNotes();
  const currentNote = currentNotes[currentNoteIndex] || null;

  useEffect(() => {
    if (isPlaying && currentNote) {
      const interval = 60000 / tempo[0]; // ms per beat
      
      intervalRef.current = setInterval(() => {
        setCurrentNoteIndex(prev => (prev + 1) % currentNotes.length);
      }, interval);
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
  }, [isPlaying, tempo, currentNotes.length]);

  useEffect(() => {
    if (currentNote) {
      onNotePlay?.(currentNote);
    }
  }, [currentNote, onNotePlay]);

  const start = () => {
    setIsPlaying(true);
    startTimeRef.current = Date.now();
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const stop = () => {
    setIsPlaying(false);
    setCurrentNoteIndex(0);
    startTimeRef.current = null;
  };

  const reset = () => {
    stop();
    setScore(0);
    setStreak(0);
  };

  const nextNote = () => {
    setCurrentNoteIndex(prev => (prev + 1) % currentNotes.length);
  };

  const previousNote = () => {
    setCurrentNoteIndex(prev => (prev - 1 + currentNotes.length) % currentNotes.length);
  };

  const getStringName = (stringNum: number): string => {
    const stringNames = ['', 'E (cao)', 'B', 'G', 'D', 'A', 'E (thấp)'];
    return stringNames[stringNum] || '';
  };

  const playRandomNote = () => {
    if (currentNotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentNotes.length);
      setCurrentNoteIndex(randomIndex);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music2 className="h-5 w-5 text-indigo-600" />
          <span>Luyện tập Note đơn</span>
        </CardTitle>
        <CardDescription>
          Thực hành các nốt đơn theo tempo và âm giai
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Chế độ luyện tập:</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PRACTICE_MODES.map((mode) => (
              <Button
                key={mode.id}
                variant={selectedMode.id === mode.id ? "default" : "outline"}
                className="h-auto p-3 text-left"
                onClick={() => setSelectedMode(mode)}
              >
                <div>
                  <div className="font-medium">{mode.name}</div>
                  <div className="text-xs opacity-75">{mode.description}</div>
                  <div className="text-xs mt-1">
                    {mode.notes.join(' - ')}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dây guitar:</label>
            <Select value={selectedString} onValueChange={setSelectedString}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả các dây</SelectItem>
                {[1, 2, 3, 4, 5, 6].map(stringNum => (
                  <SelectItem key={stringNum} value={stringNum.toString()}>
                    Dây {stringNum} ({getStringName(stringNum)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Khoảng Fret: {selectedFretRange[0]} - {selectedFretRange[1]}
            </label>
            <Slider
              value={selectedFretRange}
              onValueChange={setSelectedFretRange}
              min={0}
              max={12}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Current Note Display */}
        {currentNote && (
          <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
            <div className="text-5xl font-bold text-indigo-600 mb-2">
              {currentNote.name.replace(/[0-9]/g, '')}
            </div>
            
            <div className="flex justify-center items-center space-x-4 mb-3">
              <Badge variant="outline">
                Dây {currentNote.string}: {getStringName(currentNote.string)}
              </Badge>
              <Badge variant="outline">
                Fret {currentNote.fret}
              </Badge>
              <Badge variant="outline">
                {currentNote.frequency.toFixed(2)} Hz
              </Badge>
            </div>

            {showTabNotation && (
              <div className="bg-white p-4 rounded-lg mb-4">
                <div className="text-sm font-medium mb-2">Tab Notation:</div>
                <div className="font-mono text-sm">
                  {[1, 2, 3, 4, 5, 6].map(stringNum => (
                    <div key={stringNum} className="flex items-center space-x-2">
                      <span className="w-12 text-right">
                        {getStringName(stringNum)}:
                      </span>
                      <span className="text-lg">
                        {stringNum === currentNote.string ? currentNote.fret : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              Note {currentNoteIndex + 1} / {currentNotes.length}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-gray-600">Điểm</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{streak}</div>
            <div className="text-sm text-gray-600">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{currentNotes.length}</div>
            <div className="text-sm text-gray-600">Tổng Notes</div>
          </div>
        </div>

        {/* Tempo Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Tempo: {tempo[0]} BPM (Note mỗi {(60/tempo[0]).toFixed(1)}s)
          </label>
          <Slider
            value={tempo}
            onValueChange={setTempo}
            min={40}
            max={200}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Chậm (40)</span>
            <span>Nhanh (200)</span>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            {!isPlaying ? (
              <Button onClick={start} className="w-full bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Bắt đầu Auto
              </Button>
            ) : (
              <Button onClick={pause} className="w-full bg-yellow-600 hover:bg-yellow-700">
                <Pause className="h-4 w-4 mr-2" />
                Tạm dừng
              </Button>
            )}
            
            <div className="flex space-x-2">
              <Button onClick={previousNote} variant="outline" className="flex-1">
                ←
              </Button>
              <Button onClick={nextNote} variant="outline" className="flex-1">
                →
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={playRandomNote} variant="outline" className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Random Note
            </Button>
            
            <div className="flex space-x-2">
              <Button onClick={stop} variant="outline" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Dừng
              </Button>
              <Button onClick={reset} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showTabNotation}
              onChange={(e) => setShowTabNotation(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Hiển thị Tab notation</span>
          </label>
        </div>

        {/* Practice Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Mẹo luyện tập Note đơn:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Bắt đầu với tempo chậm để đảm bảo độ chính xác</li>
            <li>• Tập trung vào một dây trước khi chuyển sang tất cả</li>
            <li>• Luyện tập hàng ngày 10-15 phút để cải thiện muscle memory</li>
            <li>• Sử dụng metronome để giữ nhịp ổn định</li>
            <li>• Học thuộc vị trí các nốt trên cần đàn</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}