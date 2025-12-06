import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings, 
  Mic, 
  MicOff,
  SkipForward,
  Target,
  TrendingUp,
  Clock,
  Award,
  X,
  Activity,
  Music2
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { toast } from 'sonner@2.0.3';

interface ModernPracticeModeProps {
  isFullScreen?: boolean;
  onClose?: () => void;
  onComplete?: (results: any) => void;
}

interface Note {
  string: number;
  fret: number;
  finger?: number;
  status?: 'correct' | 'wrong' | 'pending';
}

interface Exercise {
  id: string;
  name: string;
  chord: string;
  notes: Note[];
  pattern: string[];
  tempo: number;
  style: string;
  lyrics?: string[];
  duration: number;
}

const MUSIC_STYLES = [
  { value: 'pop', label: 'Pop', color: 'from-pink-500 to-purple-600' },
  { value: 'rock', label: 'Rock', color: 'from-red-500 to-orange-600' },
  { value: 'blues', label: 'Blues', color: 'from-blue-500 to-indigo-600' },
  { value: 'folk', label: 'Folk', color: 'from-green-500 to-teal-600' },
  { value: 'jazz', label: 'Jazz', color: 'from-yellow-500 to-amber-600' }
];

const STRUMMING_PATTERNS = {
  pop: ['D', 'D', 'U', 'D', 'U'],
  rock: ['D', 'X', 'D', 'U', 'X', 'U'],
  blues: ['D', 'D', 'U', 'D', 'U', 'D', 'U'],
  folk: ['D', 'D', 'U', 'D', 'U', 'D', 'U', 'D'],
  jazz: ['D', 'U', 'X', 'U', 'D', 'U']
};

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: 'c_major_pop',
    name: 'C Major - Pop Style',
    chord: 'C',
    notes: [
      { string: 0, fret: 0 },
      { string: 1, fret: 1, finger: 1 },
      { string: 2, fret: 0 },
      { string: 3, fret: 2, finger: 2 },
      { string: 4, fret: 3, finger: 3 }
    ],
    pattern: STRUMMING_PATTERNS.pop,
    tempo: 120,
    style: 'pop',
    lyrics: ['This is', 'a simple', 'C major', 'progression'],
    duration: 30
  },
  {
    id: 'g_major_rock',
    name: 'G Major - Rock Style',
    chord: 'G',
    notes: [
      { string: 0, fret: 3, finger: 3 },
      { string: 1, fret: 0 },
      { string: 2, fret: 0 },
      { string: 3, fret: 0 },
      { string: 4, fret: 2, finger: 1 },
      { string: 5, fret: 3, finger: 2 }
    ],
    pattern: STRUMMING_PATTERNS.rock,
    tempo: 140,
    style: 'rock',
    lyrics: ['Rock and', 'roll never', 'dies with', 'this chord'],
    duration: 25
  }
];

export function ModernPracticeMode({ isFullScreen = true, onClose, onComplete }: ModernPracticeModeProps) {
  // State management
  const [currentExercise, setCurrentExercise] = useState<Exercise>(SAMPLE_EXERCISES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('pop');
  
  // Practice state
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctHits, setCorrectHits] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  
  // Refs
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const metronomeIntervalRef = useRef<NodeJS.Timeout>();
  
  // Calculate derived values
  const progress = (timeElapsed / currentExercise.duration) * 100;
  const beatsPerMinute = tempo;
  const beatDuration = 60 / beatsPerMinute;
  
  useEffect(() => {
    setTempo(currentExercise.tempo);
  }, [currentExercise]);

  // Main practice loop
  const startPractice = useCallback(() => {
    setIsPlaying(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    
    // Start metronome
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
    }
    
    metronomeIntervalRef.current = setInterval(() => {
      setCurrentBeat(prev => (prev + 1) % 4);
      setCurrentPatternIndex(prev => (prev + 1) % currentExercise.pattern.length);
      setCurrentLyricIndex(prev => 
        currentExercise.lyrics ? (prev + 1) % currentExercise.lyrics.length : 0
      );
      
      // Play metronome click
      if (!isMuted) {
        audioEngine.playMetronomeClick(currentBeat === 0);
      }
    }, beatDuration * 1000);
    
    // Start main loop
    const updateLoop = () => {
      if (!isPlaying) return;
      
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setTimeElapsed(elapsed);
      
      if (elapsed >= currentExercise.duration) {
        completePractice();
        return;
      }
      
      animationRef.current = requestAnimationFrame(updateLoop);
    };
    
    updateLoop();
  }, [isPlaying, beatDuration, currentBeat, currentExercise.duration, currentExercise.pattern.length, currentExercise.lyrics, isMuted]);

  const pausePractice = () => {
    setIsPaused(true);
    setIsPlaying(false);
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetPractice = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentBeat(0);
    setCurrentPatternIndex(0);
    setCurrentLyricIndex(0);
    setTimeElapsed(0);
    setScore(0);
    setAccuracy(100);
    setCorrectHits(0);
    setTotalHits(0);
    setUserNotes([]);
    
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const completePractice = () => {
    pausePractice();
    
    const finalAccuracy = totalHits > 0 ? (correctHits / totalHits) * 100 : 100;
    const results = {
      exerciseId: currentExercise.id,
      score,
      accuracy: finalAccuracy,
      timeElapsed,
      correctHits,
      totalHits
    };
    
    if (onComplete) {
      onComplete(results);
    }
    
    toast.success(`Practice Complete! Accuracy: ${finalAccuracy.toFixed(1)}%`);
  };

  const handleFretClick = (stringIndex: number, fret: number) => {
    if (!isPlaying) return;
    
    const newNote: Note = { string: stringIndex, fret };
    const expectedNote = currentExercise.notes.find(
      note => note.string === stringIndex && note.fret === fret
    );
    
    if (expectedNote) {
      newNote.status = 'correct';
      setCorrectHits(prev => prev + 1);
      setScore(prev => prev + 10);
      toast.success('Perfect!', { duration: 500 });
    } else {
      newNote.status = 'wrong';
      toast.error('Try again!', { duration: 500 });
    }
    
    setTotalHits(prev => prev + 1);
    setUserNotes(prev => [...prev, newNote]);
    
    // Update accuracy
    setAccuracy((correctHits + (newNote.status === 'correct' ? 1 : 0)) / (totalHits + 1) * 100);
  };

  const handleStrumInput = (direction: 'down' | 'up' | 'mute') => {
    if (!isPlaying) return;
    
    const expectedStroke = currentExercise.pattern[currentPatternIndex];
    const isCorrect = 
      (direction === 'down' && expectedStroke === 'D') ||
      (direction === 'up' && expectedStroke === 'U') ||
      (direction === 'mute' && expectedStroke === 'X');
    
    if (isCorrect) {
      setCorrectHits(prev => prev + 1);
      setScore(prev => prev + 5);
      toast.success('Perfect timing!', { duration: 500 });
    } else {
      toast.error('Wrong stroke!', { duration: 500 });
    }
    
    setTotalHits(prev => prev + 1);
    setAccuracy((correctHits + (isCorrect ? 1 : 0)) / (totalHits + 1) * 100);
  };

  const renderFretboard = () => (
    <div className="relative bg-gradient-to-br from-amber-900 to-amber-700 rounded-2xl p-8 shadow-2xl">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-sm animate-pulse"></div>
      
      {/* Title */}
      <div className="relative z-10 mb-6">
        <h2 className="text-2xl font-bold text-amber-100 text-center">
          Interactive Fretboard - {currentExercise.chord}
        </h2>
        <p className="text-amber-300 text-center text-sm mt-1">
          Click the glowing notes when they appear
        </p>
      </div>
      
      <div className="relative z-10">
        {/* String names */}
        <div className="flex mb-6">
          <div className="w-16 flex flex-col space-y-6 justify-center">
            {STRING_NAMES.map((stringName, idx) => (
              <div key={idx} className="text-lg font-bold text-amber-100 text-center">
                {stringName}
              </div>
            ))}
          </div>
          
          {/* Frets */}
          <div className="flex-1 relative">
            {/* Fret numbers */}
            <div className="flex mb-4">
              {Array.from({ length: 13 }, (_, i) => (
                <div key={i} className="flex-1 text-center">
                  <span className="text-sm text-amber-300">{i}</span>
                </div>
              ))}
            </div>
            
            {/* Strings and frets */}
            <div className="relative">
              {STRING_NAMES.map((_, stringIndex) => (
                <div key={stringIndex} className="flex items-center h-12 relative mb-2">
                  {/* String line */}
                  <div className="absolute inset-x-0 bg-gradient-to-r from-amber-400 to-amber-600 h-1 rounded-full shadow-lg"></div>
                  
                  {/* Fret positions */}
                  <div className="flex w-full relative z-10">
                    {Array.from({ length: 13 }, (_, fretIndex) => {
                      const expectedNote = currentExercise.notes.find(
                        note => note.string === stringIndex && note.fret === fretIndex
                      );
                      const userNote = userNotes.find(
                        note => note.string === stringIndex && note.fret === fretIndex
                      );
                      
                      const isActive = expectedNote !== undefined;
                      const isPlayed = userNote !== undefined;
                      const isCorrect = userNote?.status === 'correct';
                      const isWrong = userNote?.status === 'wrong';
                      
                      return (
                        <div key={fretIndex} className="flex-1 flex justify-center items-center">
                          <button
                            onClick={() => handleFretClick(stringIndex, fretIndex)}
                            disabled={!isPlaying}
                            className={`
                              w-8 h-8 rounded-full border-2 transition-all duration-300 transform
                              ${isPlaying ? 'hover:scale-125 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                              ${isActive && !isPlayed
                                ? 'bg-cyan-400 border-cyan-600 shadow-lg shadow-cyan-400/50 animate-pulse scale-110'
                                : isCorrect
                                ? 'bg-green-400 border-green-600 shadow-lg shadow-green-400/50 animate-bounce'
                                : isWrong
                                ? 'bg-red-400 border-red-600 shadow-lg shadow-red-400/50 animate-shake'
                                : 'bg-amber-200 border-amber-400 hover:bg-amber-300'
                              }
                            `}
                          >
                            {isActive && expectedNote.finger && (
                              <span className="text-xs font-bold text-gray-900">
                                {expectedNote.finger}
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Fret markers */}
            <div className="absolute inset-0 pointer-events-none">
              {[3, 5, 7, 9].map(fret => (
                <div
                  key={fret}
                  className="absolute w-4 h-4 bg-amber-400 rounded-full opacity-60 shadow-lg"
                  style={{
                    left: `calc(${(fret - 0.5) / 13 * 100}% - 8px)`,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
              ))}
              {/* 12th fret double dots */}
              <div
                className="absolute w-4 h-4 bg-amber-400 rounded-full opacity-60 shadow-lg"
                style={{
                  left: `calc(${(12 - 0.5) / 13 * 100}% - 8px)`,
                  top: '35%'
                }}
              />
              <div
                className="absolute w-4 h-4 bg-amber-400 rounded-full opacity-60 shadow-lg"
                style={{
                  left: `calc(${(12 - 0.5) / 13 * 100}% - 8px)`,
                  top: '65%'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrummingPattern = () => (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-purple-100 mb-4 flex items-center">
        <Target className="mr-2" />
        Strumming Pattern - {selectedStyle.toUpperCase()}
      </h3>
      
      <div className="flex justify-center space-x-4 mb-6">
        {currentExercise.pattern.map((stroke, index) => (
          <div
            key={index}
            className={`
              w-12 h-12 rounded-full border-2 flex items-center justify-center
              transition-all duration-300 transform
              ${index === currentPatternIndex && isPlaying
                ? 'bg-cyan-400 border-cyan-600 text-gray-900 scale-125 shadow-lg shadow-cyan-400/50'
                : 'bg-purple-700 border-purple-500 text-purple-100'
              }
            `}
          >
            <span className="text-lg font-bold">
              {stroke === 'D' ? '↓' : stroke === 'U' ? '↑' : 'X'}
            </span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center space-x-4">
        <Button
          onMouseDown={() => handleStrumInput('down')}
          disabled={!isPlaying}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3"
        >
          ↓ Down
        </Button>
        <Button
          onMouseDown={() => handleStrumInput('up')}
          disabled={!isPlaying}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3"
        >
          ↑ Up
        </Button>
        <Button
          onMouseDown={() => handleStrumInput('mute')}
          disabled={!isPlaying}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-3"
        >
          X Mute
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`${isFullScreen ? 'fixed inset-0' : 'relative'} bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 overflow-auto`}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center space-x-6">
            {/* Close button */}
            {onClose && (
              <Button 
                onClick={onClose} 
                variant="outline" 
                size="sm"
                className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            {/* Tempo Control & Metronome */}
            <div className="flex items-center space-x-4 bg-gray-800/30 p-3 rounded-lg">
              <span className="text-cyan-300 font-medium">Tempo:</span>
              <div className="w-32">
                <Slider
                  value={[tempo]}
                  onValueChange={(value) => setTempo(value[0])}
                  min={60}
                  max={180}
                  step={5}
                  className="w-full"
                />
              </div>
              <span className="text-cyan-300 font-mono text-lg">{tempo} BPM</span>
              
              {/* Beat indicator */}
              <div className="flex space-x-2 ml-4">
                {[0, 1, 2, 3].map(beat => (
                  <div
                    key={beat}
                    className={`w-4 h-4 rounded-full transition-all duration-150 ${
                      currentBeat === beat && isPlaying
                        ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 scale-125 animate-glow'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Backing Track Player */}
          <div className="flex items-center space-x-4 bg-gray-800/30 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setMicEnabled(!micEnabled)}
                variant="outline"
                size="sm"
                className={`${
                  micEnabled 
                    ? 'bg-red-600 border-red-500 text-white hover:bg-red-700 animate-pulse' 
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                <span className="ml-1 text-xs">Mic</span>
              </Button>
              
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant="outline"
                size="sm"
                className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  className="w-full"
                />
              </div>
              <span className="text-gray-300 text-sm">{volume}%</span>
            </div>
            
            {/* Style selector */}
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger className="w-32 bg-gray-800/50 border-gray-600 text-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MUSIC_STYLES.map(style => (
                  <SelectItem key={style.value} value={style.value}>
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.color} mr-2 inline-block`}></div>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 grid grid-cols-12 gap-6 p-6">
          {/* Left Panel - Fretboard */}
          <div className="col-span-8">
            <div className="space-y-6">
              {/* Current chord display */}
              <div className="text-center">
                <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                  {currentExercise.chord}
                </h1>
                <p className="text-xl text-gray-300">{currentExercise.name}</p>
              </div>
              
              {/* Fretboard */}
              {renderFretboard()}
              
              {/* Strumming pattern */}
              {renderStrummingPattern()}
            </div>
          </div>
          
          {/* Right Panel */}
          <div className="col-span-4 space-y-6">
            {/* Progress */}
            <Card className="bg-black/40 border-gray-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Time</span>
                    <span>{timeElapsed.toFixed(1)}s / {currentExercise.duration}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats */}
            <Card className="bg-black/40 border-gray-700">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{score}</div>
                    <div className="text-sm text-gray-400">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{accuracy.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{correctHits}</div>
                    <div className="text-sm text-gray-400">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{totalHits}</div>
                    <div className="text-sm text-gray-400">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Real-time Feedback */}
            <Card className="bg-black/40 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-cyan-400" />
                  Real-time Feedback
                </h3>
                <div className="space-y-3">
                  {/* Timing feedback */}
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">Timing</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-6 rounded ${
                            i < (accuracy / 20) ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Accuracy meter */}
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Accuracy</span>
                      <span>{accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${accuracy}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Latest feedback */}
                  {totalHits > 0 && (
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-sm text-gray-300 mb-1">Latest Hit</div>
                      <div className={`text-lg font-semibold ${
                        (correctHits / totalHits) > 0.8 ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {correctHits > 0 && correctHits === totalHits ? '🎯 Perfect!' :
                         (correctHits / totalHits) > 0.8 ? '👍 Great!' :
                         (correctHits / totalHits) > 0.6 ? '⚡ Good!' :
                         '🎯 Keep trying!'}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lyrics/Sheet */}
            {currentExercise.lyrics && (
              <Card className="bg-black/40 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                    <Music2 className="h-5 w-5 mr-2 text-purple-400" />
                    Lyrics Sync
                  </h3>
                  <div className="space-y-2">
                    {currentExercise.lyrics.map((lyric, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg transition-all duration-300 ${
                          index === currentLyricIndex && isPlaying
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/50 transform scale-105'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          {index === currentLyricIndex && isPlaying && (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
                          )}
                          {lyric}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Controls */}
            <div className="space-y-4">
              {!isPlaying ? (
                <Button 
                  onClick={startPractice} 
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-4"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Practice
                </Button>
              ) : (
                <Button 
                  onClick={pausePractice} 
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-4"
                  size="lg"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={resetPractice} 
                  variant="outline"
                  className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={() => {
                    const nextIndex = (SAMPLE_EXERCISES.indexOf(currentExercise) + 1) % SAMPLE_EXERCISES.length;
                    setCurrentExercise(SAMPLE_EXERCISES[nextIndex]);
                    resetPractice();
                  }}
                  variant="outline"
                  className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}