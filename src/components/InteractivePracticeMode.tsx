import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Pause, RotateCcw, Volume2, Target, CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { toast } from 'sonner@2.0.3';

// Định nghĩa các bài tập tương tác
interface InteractiveExercise {
  id: string;
  title: string;
  description: string;
  type: 'chord_matching' | 'rhythm_following' | 'progression_practice';
  difficulty: number;
  chords: string[];
  pattern?: any[];
  tempo: number;
  instructions: string[];
  duration: number; // seconds
}

const interactiveExercises: InteractiveExercise[] = [
  {
    id: 'beginner_chord_match',
    title: 'Khớp Hợp Âm Cơ Bản',
    description: 'Nghe hợp âm và chơi theo đúng thời điểm',
    type: 'chord_matching',
    difficulty: 1,
    chords: ['C', 'G', 'Am', 'F'],
    tempo: 80,
    instructions: [
      '1. Nghe hợp âm mẫu',
      '2. Chơi hợp âm khi thấy tín hiệu',
      '3. Cố gắng khớp đúng thời điểm'
    ],
    duration: 4
  },
  {
    id: 'rhythm_follow_basic',
    title: 'Theo Nhịp Cơ Bản',
    description: 'Đệm theo pattern hiển thị trên màn hình',
    type: 'rhythm_following',
    difficulty: 2,
    chords: ['C'],
    pattern: [
      { beat: 0, type: 'down', visual: true },
      { beat: 1, type: 'down', visual: true },
      { beat: 1.5, type: 'up', visual: true },
      { beat: 2.5, type: 'up', visual: true },
      { beat: 3, type: 'down', visual: true },
      { beat: 3.5, type: 'up', visual: true }
    ],
    tempo: 100,
    instructions: [
      '1. Chú ý pattern đệm trên màn hình',
      '2. Đệm theo đúng hướng và thời điểm',
      '3. Giữ nhịp ổn định'
    ],
    duration: 8
  },
  {
    id: 'progression_practice',
    title: 'Luyện Dãy Hợp Âm',
    description: 'Chuyển đổi hợp âm theo progression',
    type: 'progression_practice',
    difficulty: 3,
    chords: ['C', 'G', 'Am', 'F'],
    tempo: 120,
    instructions: [
      '1. Chú ý thứ tự hợp âm sẽ xuất hiện',
      '2. Chuẩn bị chuyển đổi hợp âm',
      '3. Chơi đúng hợp âm tại đúng thời điểm'
    ],
    duration: 16
  },
  {
    id: 'advanced_rhythm',
    title: 'Rhythm Nâng Cao',
    description: 'Pattern đệm phức tạp với mute',
    type: 'rhythm_following',
    difficulty: 4,
    chords: ['Em'],
    pattern: [
      { beat: 0, type: 'down', visual: true },
      { beat: 0.5, type: 'mute', visual: true },
      { beat: 1, type: 'down', visual: true },
      { beat: 1.5, type: 'up', visual: true },
      { beat: 2.5, type: 'mute', visual: true },
      { beat: 3, type: 'down', visual: true },
      { beat: 3.5, type: 'up', visual: true }
    ],
    tempo: 130,
    instructions: [
      '1. Chú ý cả strum và mute',
      '2. Mute = gạt tay để tạo âm perkussion',
      '3. Giữ timing chính xác'
    ],
    duration: 12
  },
  {
    id: 'jazz_progression',
    title: 'Progression Jazz',
    description: 'Dãy hợp âm jazz với 7th chords',
    type: 'progression_practice',
    difficulty: 5,
    chords: ['Cmaj7', 'Am7', 'Dm7', 'G7'],
    tempo: 90,
    instructions: [
      '1. Sử dụng hợp âm 7th',
      '2. Chuyển đổi mượt mà',
      '3. Cảm nhận âm hưởng jazz'
    ],
    duration: 20
  }
];

interface InteractivePracticeModeProps {
  onExerciseComplete?: (results: any) => void;
}

export function InteractivePracticeMode({ onExerciseComplete }: InteractivePracticeModeProps) {
  const [selectedExercise, setSelectedExercise] = useState<InteractiveExercise>(interactiveExercises[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [userInput, setUserInput] = useState<Array<{time: number, type: string, success: boolean}>>([]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const expectedInputsRef = useRef<Array<{time: number, type: string}>>([]);

  // Initialize exercise
  useEffect(() => {
    resetExercise();
  }, [selectedExercise]);

  const resetExercise = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
    setCurrentChordIndex(0);
    setExerciseProgress(0);
    setScore(0);
    setMaxScore(0);
    setUserInput([]);
    setShowFeedback(null);
    setTimeLeft(selectedExercise.duration);
    setExerciseComplete(false);
    setCurrentStroke(null);
    expectedInputsRef.current = [];

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Pre-calculate expected inputs based on exercise type
    if (selectedExercise.type === 'rhythm_following' && selectedExercise.pattern) {
      const measuresCount = Math.ceil(selectedExercise.duration / (240 / selectedExercise.tempo));
      for (let measure = 0; measure < measuresCount; measure++) {
        selectedExercise.pattern.forEach(stroke => {
          const absoluteTime = measure * (240 / selectedExercise.tempo) + (stroke.beat * 60 / selectedExercise.tempo);
          if (absoluteTime < selectedExercise.duration) {
            expectedInputsRef.current.push({
              time: absoluteTime,
              type: stroke.type
            });
          }
        });
      }
      setMaxScore(expectedInputsRef.current.length);
    } else if (selectedExercise.type === 'progression_practice') {
      const chordChanges = Math.floor(selectedExercise.duration / (240 / selectedExercise.tempo)) * selectedExercise.chords.length;
      setMaxScore(chordChanges);
    } else if (selectedExercise.type === 'chord_matching') {
      setMaxScore(Math.floor(selectedExercise.duration / 2)); // One chord every 2 seconds
    }
  };

  // Start exercise
  const startExercise = async () => {
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    setTimeLeft(selectedExercise.duration);

    // Start the exercise timer
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, selectedExercise.duration - elapsed);
      
      setTimeLeft(remaining);
      setExerciseProgress((elapsed / selectedExercise.duration) * 100);

      if (remaining <= 0) {
        completeExercise();
        return;
      }

      // Update based on exercise type
      if (selectedExercise.type === 'rhythm_following') {
        updateRhythmExercise(elapsed);
      } else if (selectedExercise.type === 'progression_practice') {
        updateProgressionExercise(elapsed);
      } else if (selectedExercise.type === 'chord_matching') {
        updateChordMatchingExercise(elapsed);
      }
    }, 100);

    // Play backing track or metronome
    playBackingTrack();
  };

  const updateRhythmExercise = (elapsed: number) => {
    if (!selectedExercise.pattern) return;

    const beatDuration = 60 / selectedExercise.tempo;
    const measureDuration = beatDuration * 4;
    const currentMeasureTime = elapsed % measureDuration;
    const currentBeatInMeasure = Math.floor(currentMeasureTime / beatDuration);
    
    setCurrentBeat(currentBeatInMeasure);

    // Find current stroke in pattern
    const currentStrokeTime = currentMeasureTime / beatDuration;
    const activeStroke = selectedExercise.pattern.find(stroke => 
      Math.abs(stroke.beat - currentStrokeTime) < 0.1
    );
    
    if (activeStroke && activeStroke !== currentStroke) {
      setCurrentStroke(activeStroke);
      setTimeout(() => setCurrentStroke(null), 200);
    }
  };

  const updateProgressionExercise = (elapsed: number) => {
    const chordDuration = (240 / selectedExercise.tempo); // 4 beats per chord
    const newChordIndex = Math.floor(elapsed / chordDuration) % selectedExercise.chords.length;
    
    if (newChordIndex !== currentChordIndex) {
      setCurrentChordIndex(newChordIndex);
      // Play chord
      playChordExample(selectedExercise.chords[newChordIndex]);
    }
  };

  const updateChordMatchingExercise = (elapsed: number) => {
    // Every 2 seconds, play a random chord for user to match
    if (Math.floor(elapsed) % 2 === 0 && Math.floor(elapsed) !== Math.floor(elapsed - 0.1)) {
      const randomChord = selectedExercise.chords[Math.floor(Math.random() * selectedExercise.chords.length)];
      playChordExample(randomChord);
      setCurrentChordIndex(selectedExercise.chords.indexOf(randomChord));
    }
  };

  const playBackingTrack = async () => {
    // Play metronome or backing track based on exercise
    try {
      if (selectedExercise.type === 'rhythm_following') {
        // Play metronome
        const beatInterval = setInterval(() => {
          if (!isPlaying) {
            clearInterval(beatInterval);
            return;
          }
          audioEngine.playMetronomeClick(currentBeat === 0);
        }, (60 / selectedExercise.tempo) * 1000);
      }
    } catch (error) {
      console.error('Error playing backing track:', error);
    }
  };

  const playChordExample = async (chordName: string) => {
    // This would play the chord - simplified for demo
    const chordData = getChordData(chordName);
    if (chordData) {
      try {
        await audioEngine.playChordFromFingerPattern(chordData.finger, 1);
      } catch (error) {
        console.error('Error playing chord:', error);
      }
    }
  };

  const getChordData = (chordName: string) => {
    // Simplified chord database
    const chords: {[key: string]: {finger: string}} = {
      'C': { finger: 'E|0 B|1 G|0 D|2 A|3 e|x' },
      'G': { finger: 'E|3 B|0 G|0 D|0 A|2 e|3' },
      'Am': { finger: 'E|0 B|1 G|2 D|2 A|0 e|x' },
      'F': { finger: 'E|1 B|1 G|2 D|3 A|3 e|1' },
      'Em': { finger: 'E|0 B|0 G|0 D|2 A|2 e|0' },
      'Dm': { finger: 'E|1 B|3 G|2 D|0 A|x e|x' },
      'Cmaj7': { finger: 'E|0 B|0 G|0 D|2 A|3 e|x' },
      'Am7': { finger: 'E|0 B|1 G|0 D|2 A|0 e|x' },
      'Dm7': { finger: 'E|1 B|1 G|2 D|0 A|x e|x' },
      'G7': { finger: 'E|1 B|0 G|0 D|0 A|2 e|3' }
    };
    return chords[chordName];
  };

  const handleUserInput = (inputType: string) => {
    const currentTime = (Date.now() - startTimeRef.current) / 1000;
    
    // Check if input is correct timing
    let success = false;
    let feedback = '';

    if (selectedExercise.type === 'rhythm_following') {
      // Check if there's an expected input near this time
      const expectedInput = expectedInputsRef.current.find(input => 
        Math.abs(input.time - currentTime) < 0.3 && input.type === inputType
      );
      
      if (expectedInput) {
        success = true;
        feedback = 'Chính xác! 🎯';
        setScore(prev => prev + 1);
      } else {
        feedback = 'Chưa đúng thời điểm ⏰';
      }
    } else if (selectedExercise.type === 'chord_matching') {
      const expectedChord = selectedExercise.chords[currentChordIndex];
      if (inputType === expectedChord) {
        success = true;
        feedback = 'Hợp âm đúng! 🎼';
        setScore(prev => prev + 1);
      } else {
        feedback = 'Hợp âm chưa đúng 🎸';
      }
    } else if (selectedExercise.type === 'progression_practice') {
      const expectedChord = selectedExercise.chords[currentChordIndex];
      if (inputType === expectedChord) {
        success = true;
        feedback = 'Chuyển đổi tốt! ✨';
        setScore(prev => prev + 1);
      } else {
        feedback = 'Hợp âm chưa đúng 🔄';
      }
    }

    setUserInput(prev => [...prev, { time: currentTime, type: inputType, success }]);
    setShowFeedback(feedback);
    
    setTimeout(() => setShowFeedback(null), 1000);

    if (success) {
      // Visual success feedback
      toast.success(feedback);
    }
  };

  const stopExercise = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const completeExercise = () => {
    stopExercise();
    setExerciseComplete(true);
    
    const finalScore = score;
    const accuracy = maxScore > 0 ? (finalScore / maxScore) * 100 : 0;
    
    const results = {
      exerciseId: selectedExercise.id,
      score: finalScore,
      maxScore,
      accuracy,
      duration: selectedExercise.duration,
      userInputs: userInput
    };

    if (onExerciseComplete) {
      onExerciseComplete(results);
    }

    // Show completion message
    if (accuracy >= 80) {
      toast.success(`Xuất sắc! Đạt ${accuracy.toFixed(1)}% 🏆`);
    } else if (accuracy >= 60) {
      toast.success(`Tốt! Đạt ${accuracy.toFixed(1)}% 👍`);
    } else {
      toast.error(`Cần luyện tập thêm. Đạt ${accuracy.toFixed(1)}% 💪`);
    }
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

  return (
    <div className="space-y-6">
      {/* Exercise Selection */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-indigo-600" />
            <span>Chế độ Luyện tập Tương tác</span>
          </CardTitle>
          <CardDescription>
            Luyện tập với bài tập có hướng dẫn và feedback trực tiếp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Chọn bài tập:</label>
              <Select 
                value={selectedExercise.id} 
                onValueChange={(value) => {
                  const exercise = interactiveExercises.find(e => e.id === value);
                  if (exercise) setSelectedExercise(exercise);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {interactiveExercises.map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.title} - {exercise.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exercise Info */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{selectedExercise.title}</h3>
                <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                  {getDifficultyText(selectedExercise.difficulty)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{selectedExercise.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Hướng dẫn:</h4>
                {selectedExercise.instructions.map((instruction, index) => (
                  <p key={index} className="text-xs text-gray-600">{instruction}</p>
                ))}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Tempo: {selectedExercise.tempo} BPM</span>
                <span>Thời gian: {selectedExercise.duration}s</span>
                <span>Hợp âm: {selectedExercise.chords.join(', ')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Player */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Thực hành</span>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Điểm: {score}/{maxScore}</span>
              <span>Thời gian: {Math.ceil(timeLeft)}s</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tiến độ bài tập</span>
              <span>{exerciseProgress.toFixed(1)}%</span>
            </div>
            <Progress value={exerciseProgress} className="w-full" />
          </div>

          {/* Current State Display */}
          <div className="text-center space-y-4">
            {selectedExercise.type === 'rhythm_following' && currentStroke && (
              <div className="text-6xl font-bold text-indigo-600">
                {currentStroke.type === 'down' ? '↓' : currentStroke.type === 'up' ? '↑' : 'X'}
              </div>
            )}
            
            {(selectedExercise.type === 'chord_matching' || selectedExercise.type === 'progression_practice') && (
              <div className="text-6xl font-bold text-indigo-600">
                {selectedExercise.chords[currentChordIndex] || '?'}
              </div>
            )}

            {showFeedback && (
              <div className={`text-lg font-medium ${
                showFeedback.includes('Chính xác') || showFeedback.includes('đúng') 
                  ? 'text-green-600' 
                  : 'text-orange-600'
              }`}>
                {showFeedback}
              </div>
            )}
          </div>

          {/* Beat Indicator */}
          {selectedExercise.type === 'rhythm_following' && (
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
          )}

          {/* Control Buttons */}
          <div className="flex space-x-2">
            {!isPlaying ? (
              <Button onClick={startExercise} className="flex-1 bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Bắt đầu bài tập
              </Button>
            ) : (
              <Button onClick={stopExercise} className="flex-1 bg-red-600 hover:bg-red-700">
                <Pause className="h-4 w-4 mr-2" />
                Tạm dừng
              </Button>
            )}
            
            <Button onClick={resetExercise} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Input Buttons */}
          {isPlaying && (
            <div className="space-y-4">
              {selectedExercise.type === 'rhythm_following' && (
                <div className="flex justify-center space-x-4">
                  <Button
                    onMouseDown={() => handleUserInput('down')}
                    className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700"
                  >
                    ↓ Down
                  </Button>
                  <Button
                    onMouseDown={() => handleUserInput('up')}
                    className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700"
                  >
                    ↑ Up
                  </Button>
                  <Button
                    onMouseDown={() => handleUserInput('mute')}
                    className="px-8 py-4 text-lg bg-red-600 hover:bg-red-700"
                  >
                    X Mute
                  </Button>
                </div>
              )}

              {(selectedExercise.type === 'chord_matching' || selectedExercise.type === 'progression_practice') && (
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedExercise.chords.map(chord => (
                    <Button
                      key={chord}
                      onClick={() => handleUserInput(chord)}
                      variant={currentChordIndex === selectedExercise.chords.indexOf(chord) ? 'default' : 'outline'}
                      className="px-6 py-3"
                    >
                      {chord}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {exerciseComplete && (
        <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-gold-600" />
              <span>Kết quả Bài tập</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">Điểm đạt được</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{maxScore}</div>
                <div className="text-sm text-gray-600">Điểm tối đa</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {maxScore > 0 ? ((score / maxScore) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600">Độ chính xác</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{selectedExercise.duration}</div>
                <div className="text-sm text-gray-600">Giây</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={resetExercise} className="flex-1">
                Thử lại
              </Button>
              <Button 
                onClick={() => {
                  const nextIndex = (interactiveExercises.indexOf(selectedExercise) + 1) % interactiveExercises.length;
                  setSelectedExercise(interactiveExercises[nextIndex]);
                }}
                variant="outline"
                className="flex-1"
              >
                Bài tập tiếp theo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}