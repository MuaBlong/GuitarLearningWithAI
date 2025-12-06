import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Mic, Square, RotateCcw, Volume2, Target, BookOpen, Timer, Music2, Shuffle, Zap, Activity } from "lucide-react";
import { GuitarFretboard } from "./GuitarFretboard";
import { TempoTrainer } from "./TempoTrainer";
import { SongLibrary } from "./SongLibrary";
import { SingleNoteTrainer } from "./SingleNoteTrainer";
import { RandomChordTrainer } from "./RandomChordTrainer";
import { RhythmPatternTrainer } from "./RhythmPatternTrainer";
import { InteractivePracticeMode } from "./InteractivePracticeMode";
import { ModernPracticeMode } from "./ModernPracticeMode";
import { PracticeGuide } from "./PracticeGuide";

// Định nghĩa các hợp âm với thông tin chi tiết - Đầy đủ tất cả hợp âm từ C-B
const chordDatabase = {
  major: [
    { name: 'C', fullName: 'C Major (Do Trưởng)', notes: 'C - E - G', finger: 'E|0 B|1 G|0 D|2 A|3 E|x', difficulty: 1 },
    { name: 'D', fullName: 'D Major (Re Trưởng)', notes: 'D - F# - A', finger: 'E|2 B|3 G|2 D|0 A|x E|x', difficulty: 2 },
    { name: 'E', fullName: 'E Major (Mi Trưởng)', notes: 'E - G# - B', finger: 'E|0 B|0 G|1 D|2 A|2 E|0', difficulty: 1 },
    { name: 'F', fullName: 'F Major (Fa Trưởng)', notes: 'F - A - C', finger: 'E|1 B|1 G|2 D|3 A|3 E|1', difficulty: 4 },
    { name: 'G', fullName: 'G Major (Sol Trưởng)', notes: 'G - B - D', finger: 'E|3 B|0 G|0 D|0 A|2 E|3', difficulty: 2 },
    { name: 'A', fullName: 'A Major (La Trưởng)', notes: 'A - C# - E', finger: 'E|0 B|2 G|2 D|2 A|0 E|x', difficulty: 2 },
    { name: 'B', fullName: 'B Major (Si Trưởng)', notes: 'B - D# - F#', finger: 'E|2 B|4 G|4 D|4 A|2 E|x', difficulty: 5 }
  ],
  minor: [
    { name: 'Cm', fullName: 'C Minor (Do Thứ)', notes: 'C - Eb - G', finger: 'E|3 B|4 G|5 D|5 A|3 E|x', difficulty: 5 },
    { name: 'Dm', fullName: 'D Minor (Re Thứ)', notes: 'D - F - A', finger: 'E|1 B|3 G|2 D|0 A|x E|x', difficulty: 2 },
    { name: 'Em', fullName: 'E Minor (Mi Thứ)', notes: 'E - G - B', finger: 'E|0 B|0 G|0 D|2 A|2 E|0', difficulty: 1 },
    { name: 'Fm', fullName: 'F Minor (Fa Thứ)', notes: 'F - Ab - C', finger: 'E|1 B|1 G|1 D|3 A|3 E|1', difficulty: 4 },
    { name: 'Gm', fullName: 'G Minor (Sol Thứ)', notes: 'G - Bb - D', finger: 'E|3 B|3 G|3 D|5 A|5 E|3', difficulty: 5 },
    { name: 'Am', fullName: 'A Minor (La Thứ)', notes: 'A - C - E', finger: 'E|0 B|1 G|2 D|2 A|0 E|x', difficulty: 1 },
    { name: 'Bm', fullName: 'B Minor (Si Thứ)', notes: 'B - D - F#', finger: 'E|2 B|3 G|4 D|4 A|2 E|x', difficulty: 4 }
  ],
  seventh: [
    { name: 'C7', fullName: 'C Dominant 7', notes: 'C - E - G - Bb', finger: 'E|1 B|1 G|3 D|2 A|3 E|x', difficulty: 3 },
    { name: 'D7', fullName: 'D Dominant 7', notes: 'D - F# - A - C', finger: 'E|2 B|1 G|2 D|0 A|x E|x', difficulty: 2 },
    { name: 'E7', fullName: 'E Dominant 7', notes: 'E - G# - B - D', finger: 'E|0 B|3 G|1 D|0 A|2 E|0', difficulty: 2 },
    { name: 'F7', fullName: 'F Dominant 7', notes: 'F - A - C - Eb', finger: 'E|1 B|1 G|2 D|1 A|3 E|1', difficulty: 4 },
    { name: 'G7', fullName: 'G Dominant 7', notes: 'G - B - D - F', finger: 'E|1 B|0 G|0 D|0 A|2 E|3', difficulty: 2 },
    { name: 'A7', fullName: 'A Dominant 7', notes: 'A - C# - E - G', finger: 'E|0 B|2 G|0 D|2 A|0 E|x', difficulty: 2 },
    { name: 'B7', fullName: 'B Dominant 7', notes: 'B - D# - F# - A', finger: 'E|2 B|0 G|2 D|1 A|2 E|x', difficulty: 3 }
  ],
  major7: [
    { name: 'Cmaj7', fullName: 'C Major 7', notes: 'C - E - G - B', finger: 'E|0 B|0 G|0 D|2 A|3 E|x', difficulty: 2 },
    { name: 'Dmaj7', fullName: 'D Major 7', notes: 'D - F# - A - C#', finger: 'E|2 B|2 G|2 D|0 A|x E|x', difficulty: 3 },
    { name: 'Emaj7', fullName: 'E Major 7', notes: 'E - G# - B - D#', finger: 'E|0 B|0 G|1 D|1 A|2 E|0', difficulty: 3 },
    { name: 'Fmaj7', fullName: 'F Major 7', notes: 'F - A - C - E', finger: 'E|0 B|1 G|2 D|3 A|3 E|1', difficulty: 4 },
    { name: 'Gmaj7', fullName: 'G Major 7', notes: 'G - B - D - F#', finger: 'E|2 B|0 G|0 D|0 A|2 E|3', difficulty: 3 },
    { name: 'Amaj7', fullName: 'A Major 7', notes: 'A - C# - E - G#', finger: 'E|0 B|2 G|1 D|2 A|0 E|x', difficulty: 3 },
    { name: 'Bmaj7', fullName: 'B Major 7', notes: 'B - D# - F# - A#', finger: 'E|2 B|4 G|3 D|4 A|2 E|x', difficulty: 5 }
  ],
  minor7: [
    { name: 'Cm7', fullName: 'C Minor 7', notes: 'C - Eb - G - Bb', finger: 'E|3 B|4 G|3 D|5 A|3 E|x', difficulty: 4 },
    { name: 'Dm7', fullName: 'D Minor 7', notes: 'D - F - A - C', finger: 'E|1 B|1 G|2 D|0 A|x E|x', difficulty: 2 },
    { name: 'Em7', fullName: 'E Minor 7', notes: 'E - G - B - D', finger: 'E|0 B|3 G|0 D|2 A|2 E|0', difficulty: 1 },
    { name: 'Fm7', fullName: 'F Minor 7', notes: 'F - Ab - C - Eb', finger: 'E|1 B|1 G|1 D|1 A|3 E|1', difficulty: 4 },
    { name: 'Gm7', fullName: 'G Minor 7', notes: 'G - Bb - D - F', finger: 'E|3 B|3 G|3 D|3 A|5 E|3', difficulty: 5 },
    { name: 'Am7', fullName: 'A Minor 7', notes: 'A - C - E - G', finger: 'E|0 B|1 G|0 D|2 A|0 E|x', difficulty: 1 },
    { name: 'Bm7', fullName: 'B Minor 7', notes: 'B - D - F# - A', finger: 'E|2 B|3 G|2 D|4 A|2 E|x', difficulty: 4 }
  ],
  diminished: [
    { name: 'Cdim', fullName: 'C Diminished', notes: 'C - Eb - Gb', finger: 'E|x B|4 G|5 D|4 A|3 E|x', difficulty: 5 },
    { name: 'Ddim', fullName: 'D Diminished', notes: 'D - F - Ab', finger: 'E|x B|1 G|2 D|1 A|x E|x', difficulty: 4 },
    { name: 'Edim', fullName: 'E Diminished', notes: 'E - G - Bb', finger: 'E|x B|2 G|3 D|2 A|x E|x', difficulty: 4 },
    { name: 'Fdim', fullName: 'F Diminished', notes: 'F - Ab - B', finger: 'E|x B|x G|1 D|0 A|1 E|2', difficulty: 4 },
    { name: 'Gdim', fullName: 'G Diminished', notes: 'G - Bb - Db', finger: 'E|x B|x G|0 D|2 A|1 E|3', difficulty: 4 },
    { name: 'Adim', fullName: 'A Diminished', notes: 'A - C - Eb', finger: 'E|x B|1 G|2 D|1 A|0 E|x', difficulty: 3 },
    { name: 'Bdim', fullName: 'B Diminished', notes: 'B - D - F', finger: 'E|x B|3 G|4 D|3 A|2 E|x', difficulty: 4 }
  ],
  suspended: [
    { name: 'Csus2', fullName: 'C Suspended 2nd', notes: 'C - D - G', finger: 'E|3 B|1 G|0 D|0 A|3 E|x', difficulty: 2 },
    { name: 'Csus4', fullName: 'C Suspended 4th', notes: 'C - F - G', finger: 'E|1 B|1 G|0 D|3 A|3 E|x', difficulty: 2 },
    { name: 'Dsus2', fullName: 'D Suspended 2nd', notes: 'D - E - A', finger: 'E|0 B|3 G|2 D|0 A|x E|x', difficulty: 2 },
    { name: 'Dsus4', fullName: 'D Suspended 4th', notes: 'D - G - A', finger: 'E|3 B|3 G|2 D|0 A|x E|x', difficulty: 2 },
    { name: 'Esus2', fullName: 'E Suspended 2nd', notes: 'E - F# - B', finger: 'E|0 B|0 G|4 D|4 A|2 E|0', difficulty: 3 },
    { name: 'Esus4', fullName: 'E Suspended 4th', notes: 'E - A - B', finger: 'E|0 B|0 G|2 D|2 A|0 E|0', difficulty: 1 },
    { name: 'Fsus2', fullName: 'F Suspended 2nd', notes: 'F - G - C', finger: 'E|1 B|1 G|0 D|3 A|x E|1', difficulty: 3 },
    { name: 'Fsus4', fullName: 'F Suspended 4th', notes: 'F - Bb - C', finger: 'E|1 B|1 G|3 D|3 A|x E|1', difficulty: 4 },
    { name: 'Gsus2', fullName: 'G Suspended 2nd', notes: 'G - A - D', finger: 'E|3 B|0 G|0 D|0 A|0 E|3', difficulty: 2 },
    { name: 'Gsus4', fullName: 'G Suspended 4th', notes: 'G - C - D', finger: 'E|3 B|1 G|0 D|0 A|2 E|3', difficulty: 2 },
    { name: 'Asus2', fullName: 'A Suspended 2nd', notes: 'A - B - E', finger: 'E|0 B|0 G|2 D|2 A|0 E|x', difficulty: 1 },
    { name: 'Asus4', fullName: 'A Suspended 4th', notes: 'A - D - E', finger: 'E|0 B|3 G|2 D|2 A|0 E|x', difficulty: 2 },
    { name: 'Bsus2', fullName: 'B Suspended 2nd', notes: 'B - C# - F#', finger: 'E|2 B|2 G|4 D|4 A|2 E|x', difficulty: 4 },
    { name: 'Bsus4', fullName: 'B Suspended 4th', notes: 'B - E - F#', finger: 'E|0 B|4 G|4 D|4 A|2 E|x', difficulty: 4 }
  ],
  added: [
    { name: 'Cadd9', fullName: 'C Add 9', notes: 'C - E - G - D', finger: 'E|0 B|3 G|0 D|2 A|3 E|x', difficulty: 2 },
    { name: 'Dadd9', fullName: 'D Add 9', notes: 'D - F# - A - E', finger: 'E|0 B|3 G|2 D|0 A|x E|x', difficulty: 2 },
    { name: 'Eadd9', fullName: 'E Add 9', notes: 'E - G# - B - F#', finger: 'E|0 B|0 G|1 D|4 A|2 E|0', difficulty: 3 },
    { name: 'Fadd9', fullName: 'F Add 9', notes: 'F - A - C - G', finger: 'E|3 B|1 G|2 D|3 A|3 E|1', difficulty: 4 },
    { name: 'Gadd9', fullName: 'G Add 9', notes: 'G - B - D - A', finger: 'E|3 B|0 G|0 D|0 A|0 E|3', difficulty: 2 },
    { name: 'Aadd9', fullName: 'A Add 9', notes: 'A - C# - E - B', finger: 'E|0 B|0 G|2 D|2 A|0 E|x', difficulty: 1 },
    { name: 'Badd9', fullName: 'B Add 9', notes: 'B - D# - F# - C#', finger: 'E|2 B|2 G|4 D|4 A|2 E|x', difficulty: 4 }
  ]
};

const practicePrograms = [
  {
    id: 'beginner',
    name: 'Người mới bắt đầu',
    description: 'Học các hợp âm cơ bản',
    chords: ['C', 'G', 'Am', 'F']
  },
  {
    id: 'intermediate',
    name: 'Trung cấp',
    description: 'Mở rộng vốn hợp âm',
    chords: ['D', 'A', 'Em', 'Bm', 'C7', 'G7']
  },
  {
    id: 'advanced',
    name: 'Nâng cao',
    description: 'Hợp âm phức tạp và chuyển đổi',
    chords: ['F#m', 'B', 'Cmaj7', 'Am7', 'D7', 'E7']
  },
  {
    id: 'jazz',
    name: 'Jazz cơ bản',
    description: 'Hợp âm jazz phổ biến',
    chords: ['Cmaj7', 'Am7', 'Dm7', 'G7', 'Em7', 'A7']
  }
];

export function PracticePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [detectedChord, setDetectedChord] = useState("C");
  const [confidence, setConfidence] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState(practicePrograms[0]);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [selectedChordType, setSelectedChordType] = useState('major');
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [practiceMode, setPracticeMode] = useState<'chords' | 'tempo' | 'songs' | 'notes' | 'random' | 'rhythm' | 'interactive' | 'modern' | 'guide'>('guide');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showFullScreenMode, setShowFullScreenMode] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Mô phỏng AI nhận diện hợp âm với độ chính xác thực tế hơn
      setTimeout(() => {
        const targetChord = selectedProgram.chords[currentChordIndex];
        const accuracy = Math.random();
        
        if (accuracy > 0.8) {
          // 80% thời gian nhận diện đúng
          setDetectedChord(targetChord);
          setConfidence(85 + Math.random() * 15); // 85-100%
        } else if (accuracy > 0.6) {
          // 20% thời gian nhận diện gần đúng
          const similarChords = getAllSimilarChords(targetChord);
          const randomSimilar = similarChords[Math.floor(Math.random() * similarChords.length)];
          setDetectedChord(randomSimilar || targetChord);
          setConfidence(60 + Math.random() * 25); // 60-85%
        } else {
          // 20% thời gian nhận diện sai hoặc không rõ
          const allChords = Object.values(chordDatabase).flat().map(c => c.name);
          const randomChord = allChords[Math.floor(Math.random() * allChords.length)];
          setDetectedChord(randomChord);
          setConfidence(30 + Math.random() * 30); // 30-60%
        }
      }, 1500 + Math.random() * 1000); // 1.5-2.5 giây
    } else {
      setConfidence(0);
    }
  };

  const getAllSimilarChords = (chord: string) => {
    // Logic để tìm hợp âm tương tự (ví dụ: C và Cmaj7, Am và A, etc.)
    const similarMap: { [key: string]: string[] } = {
      'C': ['Cmaj7', 'C7', 'Cadd9'],
      'Am': ['A', 'Am7', 'Asus2'],
      'F': ['Fmaj7', 'F7', 'Fadd9'],
      'G': ['G7', 'Gmaj7', 'Gsus4'],
      'D': ['D7', 'Dmaj7', 'Dsus2'],
      'E': ['E7', 'Emaj7', 'Esus4'],
      'Em': ['E', 'Em7', 'Asus2']
    };
    return similarMap[chord] || [chord];
  };

  const getCurrentChord = () => {
    const chordName = selectedProgram.chords[currentChordIndex];
    // Tìm hợp âm trong database
    for (const [type, chords] of Object.entries(chordDatabase)) {
      const found = chords.find(chord => chord.name === chordName);
      if (found) return found;
    }
    return chordDatabase.major[0]; // fallback
  };

  const currentChord = getCurrentChord();

  const nextChord = () => {
    setCurrentChordIndex((prev) => (prev + 1) % selectedProgram.chords.length);
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-800';
    if (level <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyText = (level: number) => {
    if (level <= 2) return 'Dễ';
    if (level <= 3) return 'Trung bình';
    return 'Khó';
  };

  const handleSongSelect = (song: any) => {
    setSelectedSong(song);
    const newProgram = {
      id: 'song',
      name: `Bài hát: ${song.title}`,
      description: `${song.artist} - ${song.genre}`,
      chords: song.progression
    };
    setSelectedProgram(newProgram);
    setCurrentChordIndex(0);
    setPracticeMode('tempo');
  };

  const handleChordChange = (chord: string, index: number) => {
    setCurrentChordIndex(index);
  };

  const handleNotePlay = (note: any) => {
    // Có thể thêm logic để phát âm thanh note
    console.log(`Playing note: ${note.name} on string ${note.string}, fret ${note.fret}`);
  };

  // Full-screen Modern Practice Mode
  if (showFullScreenMode) {
    return (
      <ModernPracticeMode 
        isFullScreen={true}
        onClose={() => setShowFullScreenMode(false)}
        onComplete={(results) => {
          console.log('Full-screen modern practice completed:', results);
          setShowFullScreenMode(false);
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner - Only show on first visit */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">🎉 Chào mừng đến với hệ thống luyện tập nâng cao!</h2>
              <p className="text-indigo-100">
                Khám phá các tính năng mới: Random Chord, Rhythm Patterns, Interactive Practice với âm thanh thực tế!
              </p>
              <div className="flex space-x-2 mt-3">
                <Button 
                  onClick={() => setPracticeMode('guide')}
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                  size="sm"
                >
                  Xem hướng dẫn
                </Button>
                <Button 
                  onClick={() => setShowFullScreenMode(true)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0"
                  size="sm"
                >
                  🚀 Modern Mode
                </Button>
                <Button 
                  onClick={() => setShowWelcome(false)}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-indigo-600"
                  size="sm"
                >
                  Đóng
                </Button>
              </div>
            </div>
            <div className="text-6xl">🎸</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🎵</span>
          <h1 className="text-3xl font-bold text-gray-900">Chế độ Luyện tập</h1>
        </div>
        
        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={practiceMode === 'guide' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPracticeMode('guide')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Hướng dẫn
          </Button>
          <Button
            variant={practiceMode === 'chords' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPracticeMode('chords')}
          >
            <Target className="h-4 w-4 mr-1" />
            Hợp âm
          </Button>
          <Button
            variant={practiceMode === 'random' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPracticeMode('random')}
          >
            <Shuffle className="h-4 w-4 mr-1" />
            Random
          </Button>
          <Button
            variant={practiceMode === 'rhythm' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPracticeMode('rhythm')}
          >
            <Activity className="h-4 w-4 mr-1" />
            Rhythm
          </Button>
          <Button
            variant={practiceMode === 'interactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPracticeMode('interactive')}
          >
            <Zap className="h-4 w-4 mr-1" />
            Tương tác
          </Button>
          <Button
            variant={practiceMode === 'modern' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPracticeMode('modern')}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0"
          >
            <Zap className="h-4 w-4 mr-1" />
            Modern Mode
          </Button>
          <Button
            variant={practiceMode === 'tempo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPracticeMode('tempo')}
          >
            <Timer className="h-4 w-4 mr-1" />
            Tempo
          </Button>
          <Button
            variant={practiceMode === 'songs' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPracticeMode('songs')}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Bài hát
          </Button>
          <Button
            variant={practiceMode === 'notes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPracticeMode('notes')}
          >
            <Music2 className="h-4 w-4 mr-1" />
            Note đơn
          </Button>
        </div>
      </div>

      {/* Program Selection - Only show for chord practice mode */}
      {practiceMode === 'chords' && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Chọn Chương trình Luyện tập</CardTitle>
            <CardDescription>Chọn chương trình phù hợp với trình độ của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {practicePrograms.map((program) => (
                <div
                  key={program.id}
                  onClick={() => setSelectedProgram(program)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedProgram.id === program.id
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <h3 className="font-medium mb-1">{program.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {program.chords.slice(0, 4).map((chord) => (
                      <Badge key={chord} variant="outline" className="text-xs">
                        {chord}
                      </Badge>
                    ))}
                    {program.chords.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{program.chords.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Practice Area */}
      {practiceMode === 'chords' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Chord Practice */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-indigo-600" />
                <span>Hợp âm Hiện tại</span>
              </CardTitle>
              <CardDescription>Thực hành hợp âm: {currentChord.fullName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <div className="text-6xl font-bold text-indigo-600">{currentChord.name}</div>
                <p className="text-lg text-gray-700">{currentChord.fullName}</p>
                <p className="text-sm text-gray-500">Nốt: {currentChord.notes}</p>
                <Badge className={getDifficultyColor(currentChord.difficulty)}>
                  Độ khó: {getDifficultyText(currentChord.difficulty)}
                </Badge>
              </div>

              <div className="flex space-x-2">
                <Button 
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={async () => {
                    try {
                      const { audioEngine } = await import('../utils/audioEngine');
                      await audioEngine.playChordFromFingerPattern(currentChord.finger, 2);
                    } catch (error) {
                      console.error('Error playing chord:', error);
                    }
                  }}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Nghe mẫu
                </Button>
                <Button variant="outline" onClick={nextChord}>
                  Hợp âm tiếp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audio Detection */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-5 w-5 text-indigo-600" />
                <span>Nhận diện Hợp âm Trực tiếp</span>
              </CardTitle>
              <CardDescription>Chơi guitar và để AI nhận diện hợp âm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Waveform Visualizer */}
              <div className="bg-gray-100 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
                <div className="flex items-end space-x-1 h-16">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 bg-indigo-500 rounded-t transition-all duration-300 ${
                        isRecording ? 'animate-pulse' : 'opacity-50'
                      }`}
                      style={{
                        height: isRecording 
                          ? `${Math.random() * 40 + 20}px` 
                          : '8px'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Detected Chord */}
              <div className="text-center space-y-3">
                <div className="text-sm text-gray-600">Hợp âm được nhận diện:</div>
                <div className="space-y-2">
                  <Badge 
                    variant="secondary" 
                    className="text-lg px-4 py-2 bg-green-100 text-green-800 border-green-200"
                  >
                    {detectedChord}
                  </Badge>
                  {confidence > 0 && (
                    <div className="text-xs text-gray-500">
                      Độ tin cậy: {confidence.toFixed(1)}%
                    </div>
                  )}
                </div>
                {detectedChord === currentChord.name && (
                  <div className="text-green-600 text-sm font-medium">
                    ✅ Chính xác! Chơi tốt lắm!
                  </div>
                )}
                {detectedChord !== currentChord.name && confidence > 70 && (
                  <div className="text-orange-600 text-sm font-medium">
                    🎵 Gần đúng rồi! Thử điều chỉnh một chút
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex space-x-3">
                <Button
                  onClick={toggleRecording}
                  className={`flex-1 ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Dừng Ghi âm
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Bắt đầu Ghi âm
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guitar Fretboard - Full width */}
          <div className="lg:col-span-2">
            <GuitarFretboard 
              chord={{
                name: currentChord.finger,
                positions: []
              }}
              showFingerNumbers={true}
              interactive={false}
              onChordPlay={() => console.log(`Playing ${currentChord.name}`)}
            />
          </div>
        </div>
      )}



      {/* Tempo Practice Mode */}
      {practiceMode === 'tempo' && (
        <TempoTrainer 
          chords={selectedProgram.chords} 
          onChordChange={handleChordChange}
        />
      )}

      {/* Songs Practice Mode */}
      {practiceMode === 'songs' && (
        <SongLibrary onSongSelect={handleSongSelect} />
      )}

      {/* Single Notes Practice Mode */}
      {practiceMode === 'notes' && (
        <SingleNoteTrainer onNotePlay={handleNotePlay} />
      )}

      {/* Random Chord Practice Mode */}
      {practiceMode === 'random' && (
        <RandomChordTrainer onChordGenerated={(chord) => {
          console.log('Generated chord:', chord);
        }} />
      )}

      {/* Rhythm Pattern Practice Mode */}
      {practiceMode === 'rhythm' && (
        <RhythmPatternTrainer initialChord={currentChord?.name} />
      )}

      {/* Interactive Practice Mode */}
      {practiceMode === 'interactive' && (
        <InteractivePracticeMode onExerciseComplete={(results) => {
          console.log('Exercise completed:', results);
        }} />
      )}

      {/* Modern Practice Mode */}
      {practiceMode === 'modern' && (
        <ModernPracticeMode 
          isFullScreen={false}
          onComplete={(results) => {
            console.log('Modern practice completed:', results);
          }}
        />
      )}

      {/* Practice Guide */}
      {practiceMode === 'guide' && (
        <PracticeGuide />
      )}

      {/* Chord Library - Show only in chord mode */}
      {practiceMode === 'chords' && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span>Thư viện Hợp âm</span>
            </CardTitle>
            <CardDescription>Khám phá và học tất cả các hợp âm</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="major" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="major" className="text-xs">Trưởng</TabsTrigger>
                <TabsTrigger value="minor" className="text-xs">Thứ</TabsTrigger>
                <TabsTrigger value="seventh" className="text-xs">Dom7</TabsTrigger>
                <TabsTrigger value="major7" className="text-xs">Maj7</TabsTrigger>
                <TabsTrigger value="minor7" className="text-xs">Min7</TabsTrigger>
                <TabsTrigger value="diminished" className="text-xs">Dim</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-2 mt-2">
                <TabsTrigger value="suspended" className="text-xs">Suspended</TabsTrigger>
                <TabsTrigger value="added" className="text-xs">Add9</TabsTrigger>
              </TabsList>
              
              {Object.entries(chordDatabase).map(([type, chords]) => (
                <TabsContent key={type} value={type} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {chords.map((chord) => (
                      <div
                        key={chord.name}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                        onClick={() => {
                          // Set this chord as current practice chord
                          const newProgram = {
                            ...selectedProgram,
                            chords: [chord.name]
                          };
                          setSelectedProgram(newProgram);
                          setCurrentChordIndex(0);
                        }}
                      >
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold text-indigo-600">{chord.name}</div>
                          <p className="text-xs text-gray-600">{chord.fullName}</p>
                          <Badge className={`${getDifficultyColor(chord.difficulty)} text-xs`}>
                            {getDifficultyText(chord.difficulty)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}